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
}
