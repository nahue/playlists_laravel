import { useAudioPlayer } from '@/hooks/use-audio-player';
import { createContext, ReactNode, useContext } from 'react';

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

interface AudioPlayerContextType {
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
    onProgress: (state: { playedSeconds: number }) => void;
    onTimeUpdate: (event: any) => void;
    onDurationChange: (event: any) => void;
    onEnded: () => void;
    onError: (error: any) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
    children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
    const audioPlayer = useAudioPlayer();

    return <AudioPlayerContext.Provider value={audioPlayer}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayerContext() {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        console.error('useAudioPlayerContext called outside of AudioPlayerProvider');
        console.trace('Stack trace:');
        // Return a mock context to prevent crashes during development
        return {
            currentSong: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 1,
            playlist: [],
            play: () => {},
            pause: () => {},
            resume: () => {},
            next: () => {},
            previous: () => {},
            seek: () => {},
            setVolume: () => {},
            setPlaylist: () => {},
            togglePlayPause: () => {},
            playerRef: { current: null },
            playerReady: false,
            onReady: () => {},
            onStart: () => {},
            onPlay: () => {},
            onPause: () => {},
            onProgress: () => {},
            onTimeUpdate: () => {},
            onDurationChange: () => {},
            onEnded: () => {},
            onError: () => {},
        } as AudioPlayerContextType;
    }
    return context;
}
