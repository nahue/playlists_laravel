import PlaylistController from '@/actions/App/Http/Controllers/PlaylistController';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { index as playlistsIndex, show as playlistsShow } from "@/routes/playlists";
import { BreadcrumbItem } from "@/types";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { ArrowLeft, Edit, Trash2, Calendar, User, Plus, Music, ExternalLink, Clock, Loader2 } from "lucide-react";
import { useState } from "react";

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
    songs: Song[];
}

interface PlaylistShowProps {
    playlist: Playlist;
}

interface DeletePlaylistDialogProps {
    playlist: Playlist;
    isOpen: boolean;
    onClose: () => void;
}

interface AddSongDialogProps {
    playlist: Playlist;
    isOpen: boolean;
    onClose: () => void;
}

interface DeleteSongDialogProps {
    song: Song;
    playlistId: number;
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

function AddSongDialog({ playlist, isOpen, onClose }: AddSongDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        artist: '',
        album: '',
        duration: '',
        url: '',
        spotify_url: '',
        notes: '',
    });

    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

    const fetchSpotifyMetadata = async (spotifyUrl: string) => {
        if (!spotifyUrl.trim()) return;

        setIsLoadingMetadata(true);
        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            console.log('CSRF Token:', csrfToken ? 'Found' : 'Not found');
            console.log('Spotify URL:', spotifyUrl);
            
            const response = await fetch('/songs/spotify-metadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ spotify_url: spotifyUrl }),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const metadata = await response.json();
                console.log('Metadata received:', metadata);
                setData({
                    ...data,
                    title: metadata.title || data.title,
                    artist: metadata.artist || data.artist,
                    album: metadata.album || data.album,
                    duration: metadata.duration || data.duration,
                    url: metadata.url || data.url,
                    spotify_url: spotifyUrl,
                });
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch Spotify metadata:', response.status, errorText);
                try {
                    const error = JSON.parse(errorText);
                    console.error('Parsed error:', error);
                } catch (e) {
                    console.error('Could not parse error response as JSON');
                }
            }
        } catch (error) {
            console.error('Error fetching Spotify metadata:', error);
        } finally {
            setIsLoadingMetadata(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/playlists/${playlist.id}/songs`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Song to Playlist</DialogTitle>
                    <DialogDescription>
                        Add a new song to "{playlist.name}"
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Song title"
                            required
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="artist">Artist *</Label>
                        <Input
                            id="artist"
                            value={data.artist}
                            onChange={(e) => setData('artist', e.target.value)}
                            placeholder="Artist name"
                            required
                        />
                        {errors.artist && <p className="text-sm text-destructive">{errors.artist}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="album">Album</Label>
                        <Input
                            id="album"
                            value={data.album}
                            onChange={(e) => setData('album', e.target.value)}
                            placeholder="Album name"
                        />
                        {errors.album && <p className="text-sm text-destructive">{errors.album}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (seconds)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={data.duration}
                            onChange={(e) => setData('duration', e.target.value)}
                            placeholder="180"
                            min="0"
                        />
                        {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="spotify_url">Spotify URL</Label>
                        <div className="flex gap-2">
                            <Input
                                id="spotify_url"
                                value={data.spotify_url}
                                onChange={(e) => setData('spotify_url', e.target.value)}
                                placeholder="https://open.spotify.com/track/..."
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fetchSpotifyMetadata(data.spotify_url)}
                                disabled={isLoadingMetadata || !data.spotify_url.trim()}
                            >
                                {isLoadingMetadata ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Load'
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Paste a Spotify track URL to automatically fill in song details
                        </p>
                        {errors.spotify_url && <p className="text-sm text-destructive">{errors.spotify_url}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="url">Other URL</Label>
                        <Input
                            id="url"
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                        />
                        {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Any notes about this song..."
                            rows={3}
                        />
                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Adding...' : 'Add Song'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteSongDialog({ song, playlistId, isOpen, onClose }: DeleteSongDialogProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(`/playlists/${playlistId}/songs/${song.id}`, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Remove Song</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove "{song.title}" by {song.artist} from this playlist?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Removing...' : 'Remove Song'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function PlaylistShow({ playlist }: PlaylistShowProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addSongDialogOpen, setAddSongDialogOpen] = useState(false);
    const [deleteSongDialogOpen, setDeleteSongDialogOpen] = useState(false);
    const [songToDelete, setSongToDelete] = useState<Song | null>(null);

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

    const handleAddSongClick = () => {
        setAddSongDialogOpen(true);
    };

    const handleAddSongDialogClose = () => {
        setAddSongDialogOpen(false);
    };

    const handleDeleteSongClick = (song: Song) => {
        setSongToDelete(song);
        setDeleteSongDialogOpen(true);
    };

    const handleDeleteSongDialogClose = () => {
        setDeleteSongDialogOpen(false);
        setSongToDelete(null);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                        <Button variant="outline" size="sm" onClick={handleAddSongClick}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Song
                        </Button>
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

                    {/* Songs Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Songs ({playlist.songs.length})</h2>
                            <Button variant="outline" size="sm" onClick={handleAddSongClick}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Song
                            </Button>
                        </div>
                        
                        {playlist.songs.length === 0 ? (
                            <div className="rounded-lg border p-8 text-center">
                                <Music className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">No songs added yet</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add your first song to get started
                                </p>
                                <Button className="mt-4" onClick={handleAddSongClick}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Song
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {playlist.songs.map((song, index) => (
                                    <div key={song.id} className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium truncate">{song.title}</h3>
                                                {song.spotify_url && (
                                                    <a 
                                                        href={song.spotify_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-700"
                                                        title="Open in Spotify"
                                                    >
                                                        <Music className="h-4 w-4" />
                                                    </a>
                                                )}
                                                {song.url && song.url !== song.spotify_url && (
                                                    <a 
                                                        href={song.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-foreground"
                                                        title="Open external link"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {song.artist}
                                                {song.album && ` • ${song.album}`}
                                            </p>
                                            {song.notes && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {song.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {song.duration && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDuration(song.duration)}
                                                </div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleDeleteSongClick(song)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Dialogs */}
                <DeletePlaylistDialog
                    playlist={playlist}
                    isOpen={deleteDialogOpen}
                    onClose={handleDeleteDialogClose}
                />
                
                <AddSongDialog
                    playlist={playlist}
                    isOpen={addSongDialogOpen}
                    onClose={handleAddSongDialogClose}
                />
                
                {songToDelete && (
                    <DeleteSongDialog
                        song={songToDelete}
                        playlistId={playlist.id}
                        isOpen={deleteSongDialogOpen}
                        onClose={handleDeleteSongDialogClose}
                    />
                )}
            </div>
        </AppLayout>
    );
}
