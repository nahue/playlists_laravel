<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SpotifyService
{
    private string $clientId;
    private string $clientSecret;
    private ?string $accessToken = null;

    public function __construct()
    {
        $this->clientId = config('services.spotify.client_id');
        $this->clientSecret = config('services.spotify.client_secret');
    }

    /**
     * Get access token from Spotify
     */
    private function getAccessToken(): string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        try {
            $response = Http::asForm()->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'client_credentials',
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            if ($response->successful()) {
                $this->accessToken = $response->json()['access_token'];
                return $this->accessToken;
            }

            throw new \Exception('Failed to get Spotify access token');
        } catch (\Exception $e) {
            Log::error('Spotify API error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Extract track ID from Spotify URL
     */
    public function extractTrackId(string $spotifyUrl): ?string
    {
        // Handle different Spotify URL formats:
        // https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
        // spotify:track:4iV5W9uYEdYUVa79Axb7Rh
        
        if (preg_match('/spotify:track:([a-zA-Z0-9]+)/', $spotifyUrl, $matches)) {
            return $matches[1];
        }
        
        if (preg_match('/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/', $spotifyUrl, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Extract album ID from Spotify URL
     */
    public function extractAlbumId(string $spotifyUrl): ?string
    {
        if (preg_match('/spotify:album:([a-zA-Z0-9]+)/', $spotifyUrl, $matches)) {
            return $matches[1];
        }
        
        if (preg_match('/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/', $spotifyUrl, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Extract playlist ID from Spotify URL
     */
    public function extractPlaylistId(string $spotifyUrl): ?string
    {
        if (preg_match('/spotify:playlist:([a-zA-Z0-9]+)/', $spotifyUrl, $matches)) {
            return $matches[1];
        }
        
        if (preg_match('/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/', $spotifyUrl, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Get track metadata from Spotify API
     */
    public function getTrackMetadata(string $spotifyUrl): ?array
    {
        $trackId = $this->extractTrackId($spotifyUrl);
        
        if (!$trackId) {
            return null;
        }

        try {
            $accessToken = $this->getAccessToken();
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get("https://api.spotify.com/v1/tracks/{$trackId}");

            if ($response->successful()) {
                $track = $response->json();
                
                return [
                    'title' => $track['name'],
                    'artist' => $this->formatArtists($track['artists']),
                    'album' => $track['album']['name'],
                    'duration' => round($track['duration_ms'] / 1000), // Convert to seconds
                    'spotify_url' => $spotifyUrl,
                    'url' => $track['external_urls']['spotify'] ?? $spotifyUrl,
                ];
            }

            Log::warning('Spotify API returned error: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Spotify API error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Format artists array into a string
     */
    private function formatArtists(array $artists): string
    {
        return collect($artists)->pluck('name')->join(', ');
    }

    /**
     * Get album metadata and tracks from Spotify API
     */
    public function getAlbumMetadata(string $spotifyUrl): ?array
    {
        $albumId = $this->extractAlbumId($spotifyUrl);
        
        if (!$albumId) {
            return null;
        }

        try {
            $accessToken = $this->getAccessToken();
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get("https://api.spotify.com/v1/albums/{$albumId}");

            if ($response->successful()) {
                $album = $response->json();
                $albumName = $album['name'];
                
                return [
                    'name' => $albumName,
                    'description' => "Album by {$this->formatArtists($album['artists'])}",
                    'tracks' => array_map(function($track) use ($albumName) {
                        return [
                            'title' => $track['name'],
                            'artist' => $this->formatArtists($track['artists']),
                            'album' => $albumName,
                            'duration' => round($track['duration_ms'] / 1000),
                            'url' => $track['external_urls']['spotify'],
                            'spotify_url' => $track['external_urls']['spotify'],
                        ];
                    }, $album['tracks']['items'])
                ];
            }

            Log::warning('Spotify API returned error for album: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Spotify API error for album: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get playlist metadata and tracks from Spotify API
     */
    public function getPlaylistMetadata(string $spotifyUrl): ?array
    {
        $playlistId = $this->extractPlaylistId($spotifyUrl);
        
        if (!$playlistId) {
            return null;
        }

        try {
            $accessToken = $this->getAccessToken();
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get("https://api.spotify.com/v1/playlists/{$playlistId}");

            if ($response->successful()) {
                $playlist = $response->json();
                
                $tracks = [];
                foreach ($playlist['tracks']['items'] as $item) {
                    if ($item['track'] && $item['track']['type'] === 'track') {
                        $track = $item['track'];
                        $tracks[] = [
                            'title' => $track['name'],
                            'artist' => $this->formatArtists($track['artists']),
                            'album' => $track['album']['name'],
                            'duration' => round($track['duration_ms'] / 1000),
                            'url' => $track['external_urls']['spotify'],
                            'spotify_url' => $track['external_urls']['spotify'],
                        ];
                    }
                }
                
                return [
                    'name' => $playlist['name'],
                    'description' => $playlist['description'] ?: "Playlist by {$playlist['owner']['display_name']}",
                    'tracks' => $tracks
                ];
            }

            Log::warning('Spotify API returned error for playlist: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Spotify API error for playlist: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Validate if URL is a valid Spotify track URL
     */
    public function isValidSpotifyUrl(string $url): bool
    {
        return $this->extractTrackId($url) !== null;
    }

    /**
     * Validate if URL is a valid Spotify album URL
     */
    public function isValidSpotifyAlbumUrl(string $url): bool
    {
        return $this->extractAlbumId($url) !== null;
    }

    /**
     * Validate if URL is a valid Spotify playlist URL
     */
    public function isValidSpotifyPlaylistUrl(string $url): bool
    {
        return $this->extractPlaylistId($url) !== null;
    }
}
