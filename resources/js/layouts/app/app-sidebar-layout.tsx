import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AudioPlayer } from '@/components/audio-player';
import { useAudioPlayerContext } from '@/contexts/audio-player-context';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

function AppLayoutWithPlayer({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const audioPlayer = useAudioPlayerContext();

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden pb-20">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <AudioPlayer
                currentSong={audioPlayer.currentSong}
                playlist={audioPlayer.playlist}
                isPlaying={audioPlayer.isPlaying}
                currentTime={audioPlayer.currentTime}
                duration={audioPlayer.duration}
                volume={audioPlayer.volume}
                onPlay={audioPlayer.resume}
                onPause={audioPlayer.pause}
                onNext={audioPlayer.next}
                onPrevious={audioPlayer.previous}
                onSeek={audioPlayer.seek}
                onVolumeChange={audioPlayer.setVolume}
                playerRef={audioPlayer.playerRef}
                playerReady={audioPlayer.playerReady}
                onReady={audioPlayer.onReady}
                onStart={audioPlayer.onStart}
                onPlayEvent={audioPlayer.onPlay}
                onPauseEvent={audioPlayer.onPause}
                onProgress={audioPlayer.onProgress}
                onTimeUpdate={audioPlayer.onTimeUpdate}
                onDurationChange={audioPlayer.onDurationChange}
                onEnded={audioPlayer.onEnded}
                onError={audioPlayer.onError}
            />
        </AppShell>
    );
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return <AppLayoutWithPlayer breadcrumbs={breadcrumbs}>{children}</AppLayoutWithPlayer>;
}
