import { useCallback, useEffect, useRef, useState } from 'react';

interface Song {
    id: number;
    title: string;
    artist: string;
    album?: string;
    duration?: number;
    url?: string;
    spotify_url?: string;
    notes?: string;
    order: number;
    created_at: string;
    updated_at: string;
}

interface UseAudioPlayerReturn {
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playlist: Song[];
    play: (song: Song) => void;
    pause: () => void;
    resume: () => void;
    next: () => void;
    previous: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setPlaylist: (songs: Song[]) => void;
    togglePlayPause: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [playlist, setPlaylist] = useState<Song[]>([]);

    // Initialize audio element
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'metadata';
            audioRef.current.crossOrigin = 'anonymous';
        }

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleDurationChange = () => {
            setDuration(audio.duration || 0);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            // Auto-play next song if available
            const currentIndex = playlist.findIndex((song) => song.id === currentSong?.id);
            if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
                const nextSong = playlist[currentIndex + 1];
                play(nextSong);
            }
        };

        const handleLoadStart = () => {
            setCurrentTime(0);
        };

        const handleCanPlay = () => {
            // Audio is ready to play
        };

        const handleError = (e: Event) => {
            console.error('Audio error:', e);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
        };
    }, [currentSong, playlist]);

    const play = useCallback(
        (song: Song) => {
            if (!audioRef.current) return;

            const audio = audioRef.current;

            // If it's the same song and it's paused, just resume
            if (currentSong?.id === song.id && !isPlaying) {
                audio
                    .play()
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(console.error);
                return;
            }

            // Load new song
            setCurrentSong(song);
            setCurrentTime(0);

            // Check if it's a Spotify URL (which can't be played directly)
            const isSpotifyUrl = song.spotify_url && (song.spotify_url.includes('open.spotify.com') || song.spotify_url.includes('spotify:'));

            // Try to use the song's direct URL first, avoid Spotify URLs
            const audioUrl = song.url && !song.url.includes('open.spotify.com') ? song.url : null;

            if (audioUrl) {
                audio.src = audioUrl;
                audio.load();
                audio
                    .play()
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((error) => {
                        console.error('Error playing audio:', error);
                        setIsPlaying(false);
                        // If direct URL fails and we have a Spotify URL, show a message
                        if (song.spotify_url) {
                            alert(`Cannot play "${song.title}" directly. Please open the Spotify link to listen.`);
                        }
                    });
            } else if (isSpotifyUrl) {
                // For Spotify URLs, show a message and open in new tab
                alert(`"${song.title}" is a Spotify track. Opening in Spotify...`);
                window.open(song.spotify_url, '_blank');
                setIsPlaying(false);
            } else {
                console.warn('No playable audio URL available for song:', song.title);
                setIsPlaying(false);
            }
        },
        [currentSong, isPlaying],
    );

    const pause = useCallback(() => {
        if (audioRef.current && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [isPlaying]);

    const resume = useCallback(() => {
        if (audioRef.current && !isPlaying) {
            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(console.error);
        }
    }, [isPlaying]);

    const next = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        const currentIndex = playlist.findIndex((song) => song.id === currentSong.id);
        if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
            const nextSong = playlist[currentIndex + 1];
            play(nextSong);
        }
    }, [currentSong, playlist, play]);

    const previous = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        const currentIndex = playlist.findIndex((song) => song.id === currentSong.id);
        if (currentIndex > 0) {
            const prevSong = playlist[currentIndex - 1];
            play(prevSong);
        }
    }, [currentSong, playlist, play]);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const setVolume = useCallback((newVolume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolumeState(newVolume);
        }
    }, []);

    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            resume();
        }
    }, [isPlaying, pause, resume]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle shortcuts when not typing in an input
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    if (event.shiftKey) {
                        // Skip forward 10 seconds
                        seek(Math.min(currentTime + 10, duration));
                    } else {
                        next();
                    }
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    if (event.shiftKey) {
                        // Skip backward 10 seconds
                        seek(Math.max(currentTime - 10, 0));
                    } else {
                        previous();
                    }
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setVolume(Math.min(volume + 0.1, 1));
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    setVolume(Math.max(volume - 0.1, 0));
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentTime, duration, volume, togglePlayPause, next, previous, seek, setVolume]);

    return {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        playlist,
        play,
        pause,
        resume,
        next,
        previous,
        seek,
        setVolume,
        setPlaylist,
        togglePlayPause,
    };
}
