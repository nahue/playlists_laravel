import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

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

interface AudioPlayerProps {
    currentSong: Song | null;
    playlist: Song[];
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
    onSongSelect: (song: Song) => void;
}

export function AudioPlayer({
    currentSong,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    onSeek,
    onVolumeChange,
}: AudioPlayerProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(1);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVolumeToggle = () => {
        if (isMuted) {
            onVolumeChange(previousVolume);
            setIsMuted(false);
        } else {
            setPreviousVolume(volume);
            onVolumeChange(0);
            setIsMuted(true);
        }
    };

    const handleSeek = (value: number[]) => {
        onSeek(value[0]);
    };

    const handleVolumeSlider = (value: number[]) => {
        const newVolume = value[0];
        onVolumeChange(newVolume);
        setIsMuted(newVolume === 0);
    };

    if (!currentSong) {
        return null;
    }

    // Check if current song is a Spotify URL that can't be played directly
    const isSpotifyUrl =
        currentSong.spotify_url && (currentSong.spotify_url.includes('open.spotify.com') || currentSong.spotify_url.includes('spotify:'));
    const hasDirectUrl = currentSong.url && !currentSong.url.includes('open.spotify.com');

    return (
        <TooltipProvider>
            <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Song Info */}
                    <div className="flex max-w-xs min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                            <span className="text-lg font-bold text-muted-foreground">{currentSong.title.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="truncate font-medium">{currentSong.title}</h4>
                            <p className="truncate text-sm text-muted-foreground">{currentSong.artist}</p>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex max-w-md flex-1 flex-col items-center gap-2">
                        {/* Control Buttons */}
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={onPrevious} disabled={playlist.length <= 1} className="h-8 w-8 p-0">
                                        <SkipBack className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Previous (←)</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (isSpotifyUrl && !hasDirectUrl) {
                                                // Open Spotify URL directly
                                                window.open(currentSong.spotify_url, '_blank');
                                            } else {
                                                // Use normal play/pause
                                                if (isPlaying) {
                                                    onPause();
                                                } else {
                                                    onPlay();
                                                }
                                            }
                                        }}
                                        className="h-10 w-10 p-0"
                                    >
                                        {isSpotifyUrl && !hasDirectUrl ? (
                                            <ExternalLink className="h-5 w-5" />
                                        ) : isPlaying ? (
                                            <Pause className="h-5 w-5" />
                                        ) : (
                                            <Play className="h-5 w-5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{isSpotifyUrl && !hasDirectUrl ? 'Open in Spotify' : isPlaying ? 'Pause (Space)' : 'Play (Space)'}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={onNext} disabled={playlist.length <= 1} className="h-8 w-8 p-0">
                                        <SkipForward className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Next (→)</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex w-full items-center gap-2">
                            <span className="w-10 text-right text-xs text-muted-foreground">{formatTime(currentTime)}</span>
                            <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} className="flex-1" />
                            <span className="w-10 text-xs text-muted-foreground">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Volume Control */}
                    <div className="flex max-w-xs min-w-0 flex-1 items-center justify-end gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={handleVolumeToggle} className="h-8 w-8 p-0">
                                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Volume (↑↓)</p>
                            </TooltipContent>
                        </Tooltip>
                        <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeSlider} className="w-20" />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
