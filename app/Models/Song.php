<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Song extends Model
{
    protected $fillable = [
        'title',
        'artist',
        'album',
        'duration',
        'url',
        'notes',
        'playlist_id',
        'order',
    ];

    protected $casts = [
        'duration' => 'integer',
        'order' => 'integer',
    ];

    public function playlist(): BelongsTo
    {
        return $this->belongsTo(Playlist::class);
    }
}
