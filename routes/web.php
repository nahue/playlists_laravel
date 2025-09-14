<?php

use App\Http\Controllers\PlaylistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::resource('playlists', PlaylistController::class);
    
    // Song routes nested under playlists
    Route::post('playlists/{playlist}/songs', [App\Http\Controllers\SongController::class, 'store'])->name('songs.store');
    Route::put('playlists/{playlist}/songs/{song}', [App\Http\Controllers\SongController::class, 'update'])->name('songs.update');
    Route::delete('playlists/{playlist}/songs/{song}', [App\Http\Controllers\SongController::class, 'destroy'])->name('songs.destroy');
    Route::post('playlists/{playlist}/songs/reorder', [App\Http\Controllers\SongController::class, 'reorder'])->name('songs.reorder');
    
    // Spotify metadata route
    Route::post('songs/spotify-metadata', [App\Http\Controllers\SongController::class, 'fetchSpotifyMetadata'])->name('songs.spotify-metadata');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
