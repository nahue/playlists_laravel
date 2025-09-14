<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'notes' => 'nullable|string|max:1000',
        ]);

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
}
