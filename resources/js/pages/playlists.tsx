import PlaylistController from '@/actions/App/Http/Controllers/PlaylistController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { create as playlistsCreate, index as playlistsIndex, show as playlistsShow } from '@/routes/playlists';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Playlist {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

interface PlaylistsProps {
    playlists: Playlist[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Playlists',
        href: playlistsIndex().url,
    },
];

interface DeletePlaylistDialogProps {
    playlist: Playlist;
    isOpen: boolean;
    onClose: () => void;
}

function DeletePlaylistDialog({ playlist, isOpen, onClose }: DeletePlaylistDialogProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(PlaylistController.destroy.url({ playlist: playlist.id }), {
            onSuccess: () => {
                onClose();
            },
            onError: () => {
                // Keep dialog open on error so user can see error messages
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Playlist</DialogTitle>
                    <DialogDescription>Are you sure you want to delete "{playlist.name}"? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Deleting...' : 'Delete Playlist'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Playlists({ playlists: playlistsData }: PlaylistsProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);

    const handleDeleteClick = (playlist: Playlist) => {
        setPlaylistToDelete(playlist);
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setPlaylistToDelete(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Playlists" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Playlists</h1>
                    <Link href={playlistsCreate().url}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Playlist
                        </Button>
                    </Link>
                </div>

                {playlistsData.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                        <PlaceholderPattern className="h-32 w-32 stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <h3 className="mt-4 text-lg font-semibold">No playlists yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Create your first playlist to get started</p>
                        <Link href={playlistsCreate().url} className="mt-4">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Playlist
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {playlistsData.map((playlist) => (
                            <div
                                key={playlist.id}
                                className="group relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border"
                            >
                                <Link href={playlistsShow({ playlist: playlist.id }).url} className="block h-full">
                                    <div className="flex h-full cursor-pointer flex-col justify-between p-4 transition-colors hover:bg-muted/50">
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <h3 className="pr-2 text-lg font-semibold">{playlist.name}</h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteClick(playlist);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                            {playlist.description && (
                                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{playlist.description}</p>
                                            )}
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Created {new Date(playlist.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {playlistToDelete && <DeletePlaylistDialog playlist={playlistToDelete} isOpen={deleteDialogOpen} onClose={handleDeleteDialogClose} />}
            </div>
        </AppLayout>
    );
}
