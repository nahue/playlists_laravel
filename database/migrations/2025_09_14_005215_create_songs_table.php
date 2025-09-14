<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('artist');
            $table->string('album')->nullable();
            $table->integer('duration')->nullable(); // Duration in seconds
            $table->string('url')->nullable(); // External URL (YouTube, Spotify, etc.)
            $table->text('notes')->nullable(); // User notes about the song
            $table->foreignId('playlist_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0); // For ordering songs in playlist
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('songs');
    }
};
