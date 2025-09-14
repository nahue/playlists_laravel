import { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/use-audio-player';

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
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
    children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
    const audioPlayer = useAudioPlayer();

    return (
        <AudioPlayerContext.Provider value={audioPlayer}>
            {children}
        </AudioPlayerContext.Provider>
    );
}

export function useAudioPlayerContext() {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        throw new Error('useAudioPlayerContext must be used within an AudioPlayerProvider');
    }
    return context;
}
