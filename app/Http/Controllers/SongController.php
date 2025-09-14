<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\Song;
use App\Services\SpotifyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SongController extends Controller
{
    /**
     * Store a newly created song in storage.
     */
    public function store(Request $request, Playlist $playlist)
    {
        // Ensure the user can only add songs to their own playlists
        if ($playlist->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'duration' => 'nullable|integer|min:0',
            'url' => 'nullable|url|max:500',
            'spotify_url' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        // If Spotify URL is provided, try to fetch metadata
        if (!empty($validated['spotify_url'])) {
            $spotifyService = new SpotifyService();
            
            if ($spotifyService->isValidSpotifyUrl($validated['spotify_url'])) {
                $metadata = $spotifyService->getTrackMetadata($validated['spotify_url']);
                
                if ($metadata) {
                    // Merge Spotify metadata with user input (user input takes precedence)
                    $validated = array_merge($metadata, $validated);
                }
            }
        }

        // Get the next order number for this playlist
        $nextOrder = $playlist->songs()->max('order') + 1;

        $playlist->songs()->create([
            ...$validated,
            'order' => $nextOrder,
        ]);

        return redirect()->back()->with('success', 'Song added successfully!');
    }

    /**
     * Update the specified song in storage.
     */
    public function update(Request $request, Playlist $playlist, Song $song)
    {
        // Ensure the user can only update songs in their own playlists
        if ($playlist->user_id !== Auth::id() || $song->playlist_id !== $playlist->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'duration' => 'nullable|integer|min:0',
            'url' => 'nullable|url|max:500',
            'spotify_url' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $song->update($validated);

        return redirect()->back()->with('success', 'Song updated successfully!');
    }

    /**
     * Remove the specified song from storage.
     */
    public function destroy(Playlist $playlist, Song $song)
    {
        // Ensure the user can only delete songs from their own playlists
        if ($playlist->user_id !== Auth::id() || $song->playlist_id !== $playlist->id) {
            abort(403, 'Unauthorized action.');
        }

        $song->delete();

        return redirect()->back()->with('success', 'Song removed successfully!');
    }

    /**
     * Update the order of songs in the playlist.
     */
    public function reorder(Request $request, Playlist $playlist)
    {
        // Ensure the user can only reorder songs in their own playlists
        if ($playlist->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'songs' => 'required|array',
            'songs.*.id' => 'required|integer|exists:songs,id',
            'songs.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['songs'] as $songData) {
            $song = $playlist->songs()->find($songData['id']);
            if ($song) {
                $song->update(['order' => $songData['order']]);
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * Fetch Spotify metadata for a given URL
     */
    public function fetchSpotifyMetadata(Request $request)
    {
        Log::info('Spotify metadata request received', [
            'url' => $request->spotify_url,
            'user_id' => auth()->id(),
            'headers' => $request->headers->all()
        ]);

        $request->validate([
            'spotify_url' => 'required|string|max:500',
        ]);

        $spotifyService = new SpotifyService();
        
        if (!$spotifyService->isValidSpotifyUrl($request->spotify_url)) {
            Log::warning('Invalid Spotify URL format', ['url' => $request->spotify_url]);
            return response()->json([
                'error' => 'Invalid Spotify URL format'
            ], 400);
        }

        $metadata = $spotifyService->getTrackMetadata($request->spotify_url);
        
        if (!$metadata) {
            Log::warning('Could not fetch metadata from Spotify', ['url' => $request->spotify_url]);
            return response()->json([
                'error' => 'Could not fetch metadata from Spotify'
            ], 400);
        }

        Log::info('Successfully fetched Spotify metadata', ['metadata' => $metadata]);
        
        return response()->json($metadata);
    }

    /**
     * Search YouTube for videos
     */
    public function searchYouTube(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:255',
        ]);

        $apiKey = config('services.youtube.api_key');
        
        if (!$apiKey) {
            return response()->json([
                'error' => 'YouTube API key not configured'
            ], 500);
        }

        $query = $request->input('query');
        $url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=" . urlencode($query) . "&key=" . $apiKey;

        try {
            $response = file_get_contents($url);
            $data = json_decode($response, true);

            if (isset($data['error'])) {
                Log::error('YouTube API error', ['error' => $data['error']]);
                return response()->json([
                    'error' => 'YouTube API error: ' . $data['error']['message']
                ], 400);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            Log::error('YouTube search error', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Failed to search YouTube'
            ], 500);
        }
    }

    /**
     * Search YouTube for a specific song and return the first result's URL
     */
    private function searchYouTubeForSong($title, $artist)
    {
        $apiKey = config('services.youtube.api_key');
        
        if (!$apiKey) {
            Log::warning('YouTube API key not configured, skipping YouTube search');
            return null;
        }

        $query = $title . ' ' . $artist;
        $url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=" . urlencode($query) . "&key=" . $apiKey;

        try {
            $response = file_get_contents($url);
            $data = json_decode($response, true);

            if (isset($data['error'])) {
                Log::warning('YouTube API error during import', [
                    'error' => $data['error'],
                    'query' => $query
                ]);
                return null;
            }

            if (isset($data['items']) && count($data['items']) > 0) {
                $videoId = $data['items'][0]['id']['videoId'];
                $youtubeUrl = "https://www.youtube.com/watch?v=" . $videoId;
                
                Log::info('Found YouTube video for song', [
                    'title' => $title,
                    'artist' => $artist,
                    'youtube_url' => $youtubeUrl
                ]);
                
                return $youtubeUrl;
            }

            Log::info('No YouTube results found for song', [
                'title' => $title,
                'artist' => $artist,
                'query' => $query
            ]);
            
            return null;
        } catch (\Exception $e) {
            Log::error('YouTube search error during import', [
                'error' => $e->getMessage(),
                'query' => $query
            ]);
            return null;
        }
    }

    /**
     * Import Spotify album or playlist and override the current playlist
     */
    public function importSpotifyContent(Request $request, Playlist $playlist)
    {
        // Ensure the user can only import to their own playlists
        if ($playlist->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'spotify_url' => 'required|string|max:500',
        ]);

        $spotifyService = new SpotifyService();
        $metadata = null;

        // Determine if it's an album or playlist
        if ($spotifyService->isValidSpotifyAlbumUrl($request->spotify_url)) {
            $metadata = $spotifyService->getAlbumMetadata($request->spotify_url);
        } elseif ($spotifyService->isValidSpotifyPlaylistUrl($request->spotify_url)) {
            $metadata = $spotifyService->getPlaylistMetadata($request->spotify_url);
        } else {
            return response()->json([
                'error' => 'Invalid Spotify album or playlist URL'
            ], 400);
        }

        if (!$metadata || empty($metadata['tracks'])) {
            return response()->json([
                'error' => 'Could not fetch tracks from Spotify'
            ], 400);
        }

        // Clear existing songs
        $playlist->songs()->delete();

        // Update playlist name and description
        $playlist->update([
            'name' => $metadata['name'],
            'description' => $metadata['description'],
        ]);

        // Add all tracks with YouTube search
        foreach ($metadata['tracks'] as $index => $trackData) {
            // Search YouTube for this song
            $youtubeUrl = $this->searchYouTubeForSong($trackData['title'], $trackData['artist']);
            
            $playlist->songs()->create([
                'title' => $trackData['title'],
                'artist' => $trackData['artist'],
                'album' => $trackData['album'],
                'duration' => $trackData['duration'],
                'url' => $youtubeUrl ?: $trackData['url'], // Use YouTube URL if found, otherwise fallback
                'spotify_url' => $trackData['spotify_url'],
                'order' => $index + 1,
            ]);
        }

        // Count how many songs got YouTube URLs
        $youtubeCount = $playlist->songs()->whereNotNull('url')->where('url', 'like', '%youtube.com%')->count();
        
        Log::info('Successfully imported Spotify content', [
            'playlist_id' => $playlist->id,
            'tracks_count' => count($metadata['tracks']),
            'youtube_urls_found' => $youtubeCount,
            'source_url' => $request->spotify_url
        ]);

        $message = "Successfully imported {$metadata['name']} with " . count($metadata['tracks']) . " tracks";
        if ($youtubeCount > 0) {
            $message .= " ({$youtubeCount} with YouTube URLs)";
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'tracks_count' => count($metadata['tracks']),
            'youtube_urls_found' => $youtubeCount
        ]);
    }
}
