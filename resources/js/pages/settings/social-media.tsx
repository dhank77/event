import { Form, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import SocialMediaController from '@/actions/App/Http/Controllers/Settings/SocialMediaController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SocialMedia({
    social_media,
}: {
    social_media: Record<string, string>;
}) {
    return (
        <>
            <Head title="Social Media Settings" />

            <h1 className="sr-only">Social Media settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Social Media"
                    description="Tambahkan tautan sosial media Anda untuk ditampilkan di profil."
                />

                <Form
                    {...SocialMediaController.update.form()}
                    options={{
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('Pengaturan sosial media berhasil disimpan.');
                        },
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors, data }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                    id="instagram"
                                    className="mt-1 block w-full"
                                    defaultValue={social_media?.instagram ?? ''}
                                    name="instagram"
                                    placeholder="https://instagram.com/username"
                                />
                                <InputError className="mt-2" message={errors.instagram} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="twitter">Twitter / X</Label>
                                <Input
                                    id="twitter"
                                    className="mt-1 block w-full"
                                    defaultValue={social_media?.twitter ?? ''}
                                    name="twitter"
                                    placeholder="https://twitter.com/username"
                                />
                                <InputError className="mt-2" message={errors.twitter} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <Input
                                    id="facebook"
                                    className="mt-1 block w-full"
                                    defaultValue={social_media?.facebook ?? ''}
                                    name="facebook"
                                    placeholder="https://facebook.com/username"
                                />
                                <InputError className="mt-2" message={errors.facebook} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    className="mt-1 block w-full"
                                    defaultValue={social_media?.linkedin ?? ''}
                                    name="linkedin"
                                    placeholder="https://linkedin.com/in/username"
                                />
                                <InputError className="mt-2" message={errors.linkedin} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="youtube">YouTube</Label>
                                <Input
                                    id="youtube"
                                    className="mt-1 block w-full"
                                    defaultValue={social_media?.youtube ?? ''}
                                    name="youtube"
                                    placeholder="https://youtube.com/@username"
                                />
                                <InputError className="mt-2" message={errors.youtube} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    className="mt-1 block w-full"
                                    defaultValue={social_media?.website ?? ''}
                                    name="website"
                                    placeholder="https://example.com"
                                />
                                <InputError className="mt-2" message={errors.website} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save</Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
