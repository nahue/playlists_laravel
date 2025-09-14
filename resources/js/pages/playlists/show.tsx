import PlaylistController from '@/actions/App/Http/Controllers/PlaylistController';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout";
import { index as playlistsIndex, show as playlistsShow } from "@/routes/playlists";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Edit, Trash2, Calendar, User } from "lucide-react";
import { useState } from "react";

interface Playlist {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface PlaylistShowProps {
    playlist: Playlist;
}

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
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Playlist</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
                    </DialogDescription>
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

export default function PlaylistShow({ playlist }: PlaylistShowProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Playlists',
            href: playlistsIndex().url,
        },
        {
            title: playlist.name,
            href: playlistsShow({ playlist: playlist.id }).url,
        },
    ];

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={playlist.name} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={playlistsIndex().url}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Playlists
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDeleteClick}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Playlist Details */}
                <div className="space-y-6">
                    {/* Title and Description */}
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{playlist.name}</h1>
                            {playlist.description && (
                                <p className="mt-2 text-lg text-muted-foreground">{playlist.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Created</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(playlist.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Created by</p>
                                <p className="text-sm text-muted-foreground">{playlist.user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border p-4">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Last updated</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(playlist.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Content</h2>
                        <div className="rounded-lg border p-8 text-center">
                            <p className="text-muted-foreground">No content added yet</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add songs, videos, or other content to your playlist
                            </p>
                        </div>
                    </div>
                </div>

                {/* Delete Dialog */}
                <DeletePlaylistDialog
                    playlist={playlist}
                    isOpen={deleteDialogOpen}
                    onClose={handleDeleteDialogClose}
                />
            </div>
        </AppLayout>
    );
}
