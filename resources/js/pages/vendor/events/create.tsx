import { Head } from '@inertiajs/react';
import { EventForm } from '@/components/event-form';
import Heading from '@/components/heading';
import { store } from '@/actions/App/Http/Controllers/Vendor/EventController';
import { index as eventsIndex, create as eventsCreate } from '@/routes/vendor/events';
import { dashboard } from '@/routes';

export default function CreateEvent() {
    return (
        <>
            <Head title="Buat Event Baru" />
            <h1 className="sr-only">Buat Event Baru</h1>

            <div className="px-4 py-6 max-w-3xl">
                <Heading
                    title="Buat Event Baru"
                    description="Isi informasi event Anda langkah demi langkah."
                />

                <div className="mt-6">
                    <EventForm
                        defaultValues={{ type: 'offline', status: 'draft' }}
                        action={store.url()}
                        method="post"
                        submitLabel="Buat Event"
                    />
                </div>
            </div>
        </>
    );
}

CreateEvent.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Kelola Event', href: eventsIndex() },
        { title: 'Buat Event', href: eventsCreate() },
    ],
};
