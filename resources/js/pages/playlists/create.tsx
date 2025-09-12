import PlaylistController from '@/actions/App/Http/Controllers/PlaylistController';
import InputError from '@/components/input-error';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { index as playlistsIndex } from "@/routes/playlists";
import { BreadcrumbItem } from "@/types";
import { Transition } from '@headlessui/react';
import { Form, Head, Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Playlists',
        href: playlistsIndex().url,
    },
    {
        title: 'Create',
        href: '/playlists/create',
    },
];

export default function CreatePlaylist() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Playlist" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Link href={playlistsIndex().url}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Playlists
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Create New Playlist</h1>
                </div>

                <div className="max-w-2xl">
                    <Form
                        {...PlaylistController.store.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={['name', 'description']}
                        resetOnSuccess
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Playlist Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        placeholder="Enter playlist name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        className="mt-1 block w-full"
                                        placeholder="Enter playlist description"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Playlist'}
                                    </Button>
                                    
                                    <Link href={playlistsIndex().url}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">Playlist created successfully!</p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AppLayout>
    );
}
