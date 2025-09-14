<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PlaylistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $playlists = Auth::user()->playlists()->latest()->get();
        
        return Inertia::render('playlists', [
            'playlists' => $playlists,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('playlists/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        Auth::user()->playlists()->create($validated);

        return redirect()->route('playlists.index')->with('success', 'Playlist created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Playlist $playlist)
    {
        // Ensure the user can only view their own playlists
        if ($playlist->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Load the user and songs relationships
        $playlist->load(['user', 'songs']);

        return Inertia::render('playlists/show', [
            'playlist' => $playlist,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Playlist $playlist)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Playlist $playlist)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Playlist $playlist)
    {
        // Ensure the user can only delete their own playlists
        if ($playlist->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $playlist->delete();

        return redirect()->route('playlists.index')->with('success', 'Playlist deleted successfully!');
    }
}
