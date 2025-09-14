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
    playerRef: React.RefObject<any>;
    playerReady: boolean;
    onReady: () => void;
    onStart: () => void;
    onPlay: () => void;
    onPause: () => void;
    onProgress: (state: any) => void;
    onTimeUpdate: (event: any) => void;
    onDurationChange: (event: any) => void;
    onEnded: () => void;
    onError: (error: any) => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
    const playerRef = useRef<any>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [playerReady, setPlayerReady] = useState(false);

    // ReactPlayer event handlers
    const handleReady = useCallback(() => {
        console.log('ReactPlayer ready');
        setPlayerReady(true);
    }, []);

    const handleStart = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleProgress = useCallback((state: any) => {
        // // Try different possible properties for the played time
        // let playedSeconds = state?.timeStamp;
        // // If we got timeStamp (which appears to be in milliseconds), convert to seconds
        // if (state?.timeStamp && typeof state.timeStamp === 'number') {
        //     playedSeconds = state.timeStamp / 1000;
        // }
        // // Validate that playedSeconds is a valid number
        // if (typeof playedSeconds === 'number' && !isNaN(playedSeconds) && isFinite(playedSeconds)) {
        //     setCurrentTime(playedSeconds);
        // } else {
        //     console.warn('Invalid playedSeconds value:', playedSeconds);
        // }
    }, []);

    const handleTimeUpdate = useCallback(
        (event: any) => {
            const player = playerRef.current;

            // We only want to update time slider if we are not currently seeking
            // if (!player || state.seeking) return;
            if (!player.duration) return;

            setCurrentTime(player.currentTime);
        },
        [setCurrentTime, playerRef],
    );

    const handleDurationChange = useCallback((event: any) => {
        // Extract duration from the event target
        const duration = event.target?.duration || 0;
        // Validate that duration is a valid number
        if (typeof duration === 'number' && !isNaN(duration) && isFinite(duration) && duration > 0) {
            setDuration(duration);
        } else {
            console.warn('Invalid duration value:', duration);
        }
    }, []);

    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        setCurrentTime(0);

        // Auto-play next song if available
        const currentIndex = playlist.findIndex((song) => song.id === currentSong?.id);
        if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
            const nextSong = playlist[currentIndex + 1];
            setCurrentSong(nextSong);
            setCurrentTime(0);
            // The player will automatically start playing the new song
        }
    }, [currentSong, playlist]);

    const handleError = useCallback(
        (error: any) => {
            console.error('ReactPlayer error:', error);
            console.error('Error details:', {
                error,
                currentSong,
                playerReady,
                playerRef: playerRef.current,
            });
            console.error('This error might prevent progress updates from working');
            setIsPlaying(false);
        },
        [currentSong, playerReady],
    );

    // Expose event handlers for the AudioPlayer component
    const playerEventHandlers = {
        onReady: handleReady,
        onStart: handleStart,
        onPlay: handlePlay,
        onPause: handlePause,
        onProgress: handleProgress,
        onTimeUpdate: handleTimeUpdate,
        onDurationChange: handleDurationChange,
        onEnded: handleEnded,
        onError: handleError,
    };

    const play = useCallback(
        (song: Song) => {
            console.log('Play function called with song:', song);
            console.log('Player ref current:', playerRef.current);
            console.log('Player ready:', playerReady);

            // If it's the same song and it's paused, just resume
            if (currentSong?.id === song.id && !isPlaying) {
                console.log('Resuming same song');
                setIsPlaying(true);
                return;
            }

            // Load new song
            console.log('Loading new song:', song.title);
            setCurrentSong(song);
            setCurrentTime(0);
            setIsPlaying(true);

            // Reset player ready state when loading new song
            setPlayerReady(false);
        },
        [currentSong, isPlaying, playerReady],
    );

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const resume = useCallback(() => {
        if (playerRef.current && !isPlaying) {
            setIsPlaying(true);
        }
    }, [isPlaying]);

    const next = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        const currentIndex = playlist.findIndex((song) => song.id === currentSong.id);
        if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
            const nextSong = playlist[currentIndex + 1];
            setCurrentSong(nextSong);
            setCurrentTime(0);
            setIsPlaying(true);
        }
    }, [currentSong, playlist]);

    const previous = useCallback(() => {
        if (!currentSong || playlist.length <= 1) return;

        const currentIndex = playlist.findIndex((song) => song.id === currentSong.id);
        if (currentIndex > 0) {
            const prevSong = playlist[currentIndex - 1];
            setCurrentSong(prevSong);
            setCurrentTime(0);
            setIsPlaying(true);
        }
    }, [currentSong, playlist]);

    const seek = useCallback(
        (time: number) => {
            // Validate the time parameter
            if (typeof time !== 'number' || isNaN(time) || !isFinite(time) || time < 0) {
                console.warn('Invalid seek time:', time);
                return;
            }

            console.log('Seek called with time:', time);
            console.log('Player ref current:', playerRef.current);
            console.log('Player ready:', playerReady);
            console.log('Current song:', currentSong);
            console.log('Is playing:', isPlaying);

            // Try to seek even if playerReady is false, as the player might still work
            if (playerRef.current) {
                try {
                    // Log available methods on the player ref
                    console.log('Available methods on player ref:', Object.getOwnPropertyNames(playerRef.current));
                    console.log('Player ref prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(playerRef.current)));

                    // Try different possible method names and access patterns
                    if (typeof playerRef.current.seekTo === 'function') {
                        playerRef.current.seekTo(time, 'seconds');
                        console.log('Called seekTo with time:', time);
                    } else if (typeof playerRef.current.seek === 'function') {
                        playerRef.current.seek(time);
                        console.log('Called seek with time:', time);
                    } else if (playerRef.current.getInternalPlayer && typeof playerRef.current.getInternalPlayer === 'function') {
                        // ReactPlayer v3 might expose internal player
                        const internalPlayer = playerRef.current.getInternalPlayer();
                        console.log('Internal player:', internalPlayer);
                        if (internalPlayer && typeof internalPlayer.currentTime !== 'undefined') {
                            internalPlayer.currentTime = time;
                            console.log('Set internal player currentTime to:', time);
                        }
                    } else if (typeof playerRef.current.currentTime !== 'undefined') {
                        // Direct property access for HTML5 media elements
                        playerRef.current.currentTime = time;
                        console.log('Set currentTime directly to:', time);
                    } else {
                        console.warn('No seek method available on player ref');
                        console.log('Player ref type:', typeof playerRef.current);
                        console.log('Player ref constructor:', playerRef.current?.constructor?.name);
                        // Try to find any seek-related methods
                        const methods = Object.getOwnPropertyNames(playerRef.current).filter(
                            (name) => name.toLowerCase().includes('seek') || name.toLowerCase().includes('time'),
                        );
                        console.log('Seek-related methods:', methods);
                    }
                } catch (error) {
                    console.error('Error seeking:', error);
                }
            } else {
                console.warn('Player ref not available');
                console.log('playerRef.current is:', playerRef.current);
                console.log('playerReady is:', playerReady);
            }
        },
        [playerReady, currentSong, isPlaying],
    );

    const setVolume = useCallback((newVolume: number) => {
        setVolumeState(newVolume);
    }, []);

    const setPlaylistSongs = useCallback((songs: Song[]) => {
        setPlaylist(songs);
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
            // Only handle shortcuts when not typing in input fields
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    seek(Math.max(0, currentTime - 10));
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    seek(Math.min(duration, currentTime + 10));
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setVolume(Math.min(1, volume + 0.1));
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    setVolume(Math.max(0, volume - 0.1));
                    break;
                case 'KeyN':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        next();
                    }
                    break;
                case 'KeyP':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        previous();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlayPause, seek, currentTime, duration, setVolume, volume, next, previous]);

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
        setPlaylist: setPlaylistSongs,
        togglePlayPause,
        playerRef,
        playerReady,
        ...playerEventHandlers,
    };
}
