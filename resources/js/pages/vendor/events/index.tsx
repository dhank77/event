import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Globe,
    MapPin,
    MonitorPlay,
    MoreHorizontal,
    Pencil,
    Plus,
    Ticket,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { index as eventsIndex, create as eventsCreate, edit as eventsEdit, destroy as eventsDestroy } from '@/routes/vendor/events';
import { dashboard } from '@/routes';

type EventType = 'online' | 'offline' | 'hybrid';
type EventStatus = 'draft' | 'published' | 'cancelled';

type EventItem = {
    id: number;
    title: string;
    slug: string;
    category: string | null;
    type: EventType;
    status: EventStatus;
    starts_at: string | null;
    ends_at: string | null;
    tickets_count: number;
    banner: string | null;
};

const typeConfig: Record<EventType, { label: string; icon: React.ElementType; color: string }> = {
    online: { label: 'Online', icon: MonitorPlay, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    offline: { label: 'Offline', icon: MapPin, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    hybrid: { label: 'Hybrid', icon: Globe, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
};

const statusConfig: Record<EventStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    published: { label: 'Published', variant: 'default' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function EventsIndex({ events }: { events: EventItem[] }) {
    const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const stats = {
        total: events.length,
        published: events.filter((e) => e.status === 'published').length,
        draft: events.filter((e) => e.status === 'draft').length,
    };

    function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(eventsDestroy({ event: deleteTarget.id }), {
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }

    return (
        <>
            <Head title="Kelola Event" />
            <h1 className="sr-only">Kelola Event</h1>

            <div className="px-4 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Kelola Event"
                        description="Buat dan kelola semua event Anda di sini."
                    />
                    <Button asChild>
                        <Link href={eventsCreate()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Event
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Event', value: stats.total, color: 'text-foreground' },
                        { label: 'Published', value: stats.published, color: 'text-green-600 dark:text-green-400' },
                        { label: 'Draft', value: stats.draft, color: 'text-muted-foreground' },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-xl border bg-card p-4">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Events list */}
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold">Belum ada event</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">
                            Mulai buat event pertama Anda sekarang.
                        </p>
                        <Button asChild>
                            <Link href={eventsCreate()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Buat Event
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Event</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Tipe</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Tanggal</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Tiket</th>
                                    <th className="w-10 px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {events.map((event) => {
                                    const typeInfo = typeConfig[event.type];
                                    const statusInfo = statusConfig[event.status];
                                    const TypeIcon = typeInfo.icon;

                                    return (
                                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {event.banner ? (
                                                        <img
                                                            src={`/storage/${event.banner}`}
                                                            alt={event.title}
                                                            className="h-10 w-16 rounded object-cover flex-shrink-0 border"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0 border">
                                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium line-clamp-1">{event.title}</p>
                                                        {event.category && (
                                                            <p className="text-xs text-muted-foreground">{event.category}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${typeInfo.color}`}>
                                                    <TypeIcon className="h-3 w-3" />
                                                    {typeInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    <span>{formatDate(event.starts_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Ticket className="h-3.5 w-3.5" />
                                                    <span>{event.tickets_count}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={eventsEdit({ event: event.id })}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit Event
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setDeleteTarget(event)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Event?</DialogTitle>
                        <DialogDescription>
                            Event <strong>"{deleteTarget?.title}"</strong> akan dihapus permanen beserta semua tiket dan kuponnya.
                            Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Menghapus...' : 'Hapus Event'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Kelola Event', href: eventsIndex() },
    ],
};
