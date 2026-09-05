import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Globe,
    MapPin,
    Minus,
    MonitorPlay,
    Plus,
    ShoppingBag,
    Tag,
    Ticket,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { PageProps } from '@/types';

type Vendor = {
    name: string;
    username: string;
    avatar: string | null;
};

type TicketItem = {
    id: number;
    name: string;
    type: 'free' | 'paid';
    tier: string;
    price: number;
    quota: number | null;
    description: string | null;
    sales_start?: string | null;
    sales_end?: string | null;
    sales_status?: 'available' | 'upcoming' | 'ended' | 'sold_out';
};

type AgendaItem = {
    id: number;
    time: string;
    title: string;
    description: string | null;
    speaker: string | null;
};

type SpeakerItem = {
    id: number;
    name: string;
    title: string | null;
    bio: string | null;
    avatar_url: string | null;
};

type SponsorItem = {
    id: number;
    name: string;
    website: string | null;
    tier: string;
    logo_url: string | null;
};

type EventData = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    type: 'online' | 'offline' | 'hybrid';
    location: string | null;
    maps_url: string | null;
    online_platform: string | null;
    online_url: string | null;
    banner: string | null;
    formatted_date: string;
    formatted_end_date: string | null;
    agendas: AgendaItem[];
    speakers: SpeakerItem[];
    sponsors: SponsorItem[];
    tickets: TicketItem[];
};

interface EventShowProps {
    vendor: Vendor;
    event: EventData;
}

export default function EventShow({ vendor, event }: EventShowProps) {
    const { auth } = usePage<PageProps>().props;
    const isOffline = event.type === 'offline' || event.type === 'hybrid';
    const isOnline = event.type === 'online' || event.type === 'hybrid';

    const [selectedTickets, setSelectedTickets] = useState<Record<number, number>>({});
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [buyerForm, setBuyerForm] = useState({
        name: auth?.user?.name || '',
        email: auth?.user?.email || '',
        phone: '',
    });
    const [orderSuccess, setOrderSuccess] = useState(false);

    const updateQuantity = (ticketId: number, qty: number, maxQty: number) => {
        const validQty = Math.max(0, Math.min(qty, maxQty));
        setSelectedTickets((prev) => {
            const next = { ...prev };
            if (validQty === 0) {
                delete next[ticketId];
            } else {
                next[ticketId] = validQty;
            }
            return next;
        });
    };

    const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
    const totalPrice = event.tickets.reduce(
        (sum, t) => sum + (selectedTickets[t.id] || 0) * t.price,
        0,
    );

    const handleConfirmOrder = () => {
        if (!buyerForm.name.trim() || !buyerForm.email.trim() || !buyerForm.phone.trim()) {
            toast.error('Mohon lengkapi semua data pemesan.');
            return;
        }
        setOrderSuccess(true);
        toast.success('Pemesanan tiket berhasil dikonfirmasi!');
    };

    // Format price Helper
    const formatPrice = (price: number) => {
        if (price === 0) return 'Gratis';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
            price,
        );
    };

    return (
        <>
            <Head title={`${event.title} by ${vendor.name}`} />

            <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
                {/* ═══ NAVBAR ═══ */}
                <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center border-2 border-foreground bg-primary font-mono text-sm font-bold text-primary-foreground shadow-sm">
                                AI
                            </div>
                            <span className="font-mono text-lg font-bold tracking-tight">acarainaja.id</span>
                        </Link>
                        <Link href={`/${vendor.username}`}>
                            <Button variant="outline" className="font-mono text-xs">
                                <ChevronLeft data-icon="inline-start" className="size-4" />
                                Profil Vendor
                            </Button>
                        </Link>
                    </nav>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <div className="grid gap-12 lg:grid-cols-[1fr_350px] lg:gap-8 xl:gap-12">
                        {/* ═══ MAIN CONTENT ═══ */}
                        <div className="space-y-10 lg:space-y-12">
                            {/* HERO BANNER & TITLE */}
                            <section className="space-y-6">
                                <div className="aspect-[21/9] w-full overflow-hidden rounded-xl border-2 border-foreground shadow-[4px_4px_0_0_#000]">
                                    {event.banner ? (
                                        <img src={event.banner} alt={event.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                                            <CalendarDays className="size-20 opacity-20" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {event.category && (
                                            <Badge className="border-2 border-foreground font-mono text-xs">
                                                <Tag className="mr-1 size-3" />
                                                {event.category}
                                            </Badge>
                                        )}
                                        <Badge
                                            variant="secondary"
                                            className="border-2 border-foreground font-mono text-xs uppercase"
                                        >
                                            {event.type}
                                        </Badge>
                                    </div>

                                    <h1 className="font-mono text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                                        {event.title}
                                    </h1>
                                </div>
                            </section>

                            {/* INFORMASI PELAKSANAAN */}
                            <div className="grid gap-4 rounded-xl border-2 border-foreground bg-card p-5 shadow-[3px_3px_0_0_#000] sm:grid-cols-2 lg:grid-cols-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-accent">
                                        <CalendarDays className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs font-bold uppercase text-muted-foreground">Waktu</p>
                                        <p className="font-mono text-sm font-bold">{event.formatted_date}</p>
                                        {event.formatted_end_date && (
                                            <p className="text-xs text-muted-foreground">s.d {event.formatted_end_date}</p>
                                        )}
                                    </div>
                                </div>

                                {isOffline && (
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-primary text-primary-foreground">
                                            <MapPin className="size-5" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-xs font-bold uppercase text-muted-foreground">Lokasi</p>
                                            <p className="font-mono text-sm font-bold">{event.location || 'Menyusul'}</p>
                                            {event.maps_url && (
                                                <a href={event.maps_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline hover:text-primary/80">
                                                    Lihat Peta
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {isOnline && (
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-secondary text-secondary-foreground">
                                            <MonitorPlay className="size-5" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-xs font-bold uppercase text-muted-foreground">Online Platform</p>
                                            <p className="font-mono text-sm font-bold">{event.online_platform || 'Menyusul'}</p>
                                            {event.online_url && (
                                                <a href={event.online_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline hover:text-primary/80">
                                                    Tautan Acara
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-foreground bg-muted">
                                        {vendor.avatar ? (
                                            <img src={vendor.avatar} alt={vendor.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Users className="m-2 size-5 opacity-50" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Diselenggarakan oleh</p>
                                        <Link href={`/${vendor.username}`} className="font-mono text-sm font-bold hover:underline">
                                            {vendor.name}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <Separator className="border-foreground" />

                            {/* DESCRIPTION */}
                            {event.description && (
                                <section className="space-y-4">
                                    <h2 className="font-mono text-2xl font-bold">Tentang Event</h2>
                                    <div 
                                        className="prose prose-zinc dark:prose-invert max-w-none font-sans"
                                        dangerouslySetInnerHTML={{ __html: event.description }} 
                                    />
                                </section>
                            )}

                            {/* SPEAKERS */}
                            {event.speakers.length > 0 && (
                                <section className="space-y-6">
                                    <h2 className="font-mono text-2xl font-bold">Pembicara</h2>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {event.speakers.map((speaker) => (
                                            <Card key={speaker.id} className="border-2 border-foreground shadow-[2px_2px_0_0_#000]">
                                                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                                                    <div className="size-24 overflow-hidden rounded-full border-2 border-foreground bg-muted">
                                                        {speaker.avatar_url ? (
                                                            <img src={speaker.avatar_url} alt={speaker.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <Users className="size-10 text-muted-foreground opacity-30" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-mono text-lg font-bold">{speaker.name}</h3>
                                                        {speaker.title && <p className="text-sm text-muted-foreground">{speaker.title}</p>}
                                                    </div>
                                                    {speaker.bio && <p className="text-sm">{speaker.bio}</p>}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* AGENDA */}
                            {event.agendas.length > 0 && (
                                <section className="space-y-6">
                                    <h2 className="font-mono text-2xl font-bold">Rundown Acara</h2>
                                    <div className="space-y-4">
                                        {event.agendas.map((agenda) => (
                                            <div key={agenda.id} className="flex gap-4 rounded-xl border-2 border-foreground bg-card p-4 shadow-[2px_2px_0_0_#000] sm:p-6">
                                                <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-foreground bg-accent py-2 font-mono text-sm font-bold sm:w-32 sm:text-base">
                                                    <Clock className="mb-1 size-4" />
                                                    {agenda.time}
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <h3 className="font-mono text-lg font-bold">{agenda.title}</h3>
                                                    {agenda.speaker && (
                                                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <Users className="size-3.5" />
                                                            {agenda.speaker}
                                                        </p>
                                                    )}
                                                    {agenda.description && (
                                                        <div 
                                                            className="prose prose-sm prose-zinc dark:prose-invert mt-2 text-muted-foreground"
                                                            dangerouslySetInnerHTML={{ __html: agenda.description }} 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* SPONSORS */}
                            {event.sponsors.length > 0 && (
                                <section className="space-y-6">
                                    <h2 className="font-mono text-2xl font-bold text-center">Disponsori Oleh</h2>
                                    <div className="flex flex-wrap justify-center gap-6">
                                        {event.sponsors.map((sponsor) => (
                                            <div key={sponsor.id} className="flex flex-col items-center gap-2">
                                                <div className="flex h-20 w-40 items-center justify-center rounded-xl border-2 border-foreground bg-card p-4 shadow-[2px_2px_0_0_#000]">
                                                    {sponsor.logo_url ? (
                                                        <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain grayscale transition-all hover:grayscale-0" />
                                                    ) : (
                                                        <span className="font-mono text-sm font-bold text-muted-foreground">{sponsor.name}</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground uppercase">{sponsor.tier} Sponsor</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* ═══ SIDEBAR ═══ */}
                        <div className="space-y-6">
                            {/* 1. TICKETS CARD (PRIMARY) */}
                            <Card className="border-2 border-foreground shadow-[4px_4px_0_0_#000]">
                                <CardHeader className="bg-primary text-primary-foreground border-b-2 border-foreground pb-4">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="size-5" />
                                        <CardTitle className="font-mono text-xl">Pilih Tiket</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    {event.tickets.length > 0 ? (
                                        event.tickets.map((ticket) => {
                                            const isUpcoming = ticket.sales_status === 'upcoming';
                                            const isEnded = ticket.sales_status === 'ended';
                                            const isSoldOut = ticket.sales_status === 'sold_out';
                                            const isAvailable = !isUpcoming && !isEnded && !isSoldOut;
                                            const maxQuota = Math.min(ticket.max_per_order || 10, ticket.quota ?? 9999);
                                            const qty = selectedTickets[ticket.id] || 0;

                                            return (
                                                <div key={ticket.id} className="rounded-lg border-2 border-foreground p-4 transition-colors hover:bg-accent/20">
                                                    <div className="mb-2 flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="font-mono font-bold">{ticket.name}</h4>
                                                                {isUpcoming && (
                                                                    <Badge variant="secondary" className="border border-foreground font-mono text-[10px]">
                                                                        Segera Hadir
                                                                    </Badge>
                                                                )}
                                                                {isEnded && (
                                                                    <Badge variant="destructive" className="font-mono text-[10px]">
                                                                        Berakhir
                                                                    </Badge>
                                                                )}
                                                                {isSoldOut && (
                                                                    <Badge variant="destructive" className="font-mono text-[10px]">
                                                                        Habis
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <Badge variant="outline" className="mt-1 text-[10px] uppercase">
                                                                {ticket.tier}
                                                            </Badge>
                                                        </div>
                                                        <span className="font-mono font-black text-primary">
                                                            {formatPrice(ticket.price)}
                                                        </span>
                                                    </div>
                                                    {ticket.description && (
                                                        <p className="mb-3 text-xs text-muted-foreground">{ticket.description}</p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">
                                                            Sisa: {ticket.quota === null ? 'Tak Terbatas' : ticket.quota}
                                                        </span>
                                                        {isAvailable ? (
                                                            qty > 0 ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="size-7 border-2 border-foreground font-mono cursor-pointer"
                                                                        onClick={() => updateQuantity(ticket.id, qty - 1, maxQuota)}
                                                                    >
                                                                        <Minus className="size-3" />
                                                                    </Button>
                                                                    <span className="w-6 text-center font-mono font-bold text-xs">{qty}</span>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="size-7 border-2 border-foreground font-mono cursor-pointer"
                                                                        disabled={qty >= maxQuota}
                                                                        onClick={() => updateQuantity(ticket.id, qty + 1, maxQuota)}
                                                                    >
                                                                        <Plus className="size-3" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 text-xs font-mono cursor-pointer"
                                                                    onClick={() => updateQuantity(ticket.id, 1, maxQuota)}
                                                                >
                                                                    Beli
                                                                </Button>
                                                            )
                                                        ) : (
                                                            <Button size="sm" className="h-7 text-xs font-mono" disabled>
                                                                {isSoldOut ? 'Habis' : isUpcoming ? 'Belum Buka' : 'Berakhir'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                                            <Ticket className="mb-2 size-8 opacity-20" />
                                            <p className="text-sm">Tiket belum tersedia</p>
                                        </div>
                                    )}
                                </CardContent>
                                {event.tickets.length > 0 && (
                                    <CardFooter className="flex flex-col gap-3 pt-0">
                                        <div className="flex w-full items-center justify-between border-t-2 border-foreground/20 pt-3 font-mono text-sm">
                                            <span className="text-muted-foreground">Total ({totalTickets} tiket):</span>
                                            <span className="font-bold text-primary text-base">
                                                {formatPrice(totalPrice)}
                                            </span>
                                        </div>
                                        <Button
                                            className="w-full font-mono text-sm shadow-[2px_2px_0_0_#000] cursor-pointer"
                                            size="lg"
                                            disabled={totalTickets === 0}
                                            onClick={() => {
                                                setOrderSuccess(false);
                                                setCheckoutOpen(true);
                                            }}
                                        >
                                            <ShoppingBag className="mr-2 size-4" />
                                            Checkout Pembelian
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>

                            {/* 2. EVENT DETAILS CARD */}
                            <Card className="border-2 border-foreground shadow-[4px_4px_0_0_#000]">
                                <CardHeader className="bg-muted border-b-2 border-foreground pb-4">
                                    <CardTitle className="font-mono text-xl">Informasi Pelaksanaan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-accent">
                                            <CalendarDays className="size-5" />
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold">Waktu</p>
                                            <p className="text-sm text-muted-foreground">{event.formatted_date}</p>
                                            {event.formatted_end_date && (
                                                <p className="text-sm text-muted-foreground">s.d {event.formatted_end_date}</p>
                                            )}
                                        </div>
                                    </div>

                                    {isOffline && (
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-primary text-primary-foreground">
                                                <MapPin className="size-5" />
                                            </div>
                                            <div>
                                                <p className="font-mono font-bold">Lokasi</p>
                                                <p className="text-sm text-muted-foreground">{event.location || 'Menyusul'}</p>
                                                {event.maps_url && (
                                                    <a href={event.maps_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline hover:text-primary/80">
                                                        Lihat Peta
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {isOnline && (
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-secondary text-secondary-foreground">
                                                <MonitorPlay className="size-5" />
                                            </div>
                                            <div>
                                                <p className="font-mono font-bold">Online Platform</p>
                                                <p className="text-sm text-muted-foreground">{event.online_platform || 'Menyusul'}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <Separator className="border-foreground" />

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-foreground bg-muted">
                                                {vendor.avatar ? (
                                                    <img src={vendor.avatar} alt={vendor.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Users className="m-1.5 size-4 opacity-50" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Diselenggarakan oleh</p>
                                                <Link href={`/${vendor.username}`} className="font-mono text-sm font-bold hover:underline">
                                                    {vendor.name}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>

                {/* ═══ CHECKOUT DIALOG ═══ */}
                <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                    <DialogContent className="border-2 border-foreground shadow-[6px_6px_0_0_#000] sm:max-w-lg">
                        {!orderSuccess ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="font-mono text-xl font-bold">
                                        Pemesanan Tiket
                                    </DialogTitle>
                                    <DialogDescription className="font-sans text-xs">
                                        {event.title} • {event.formatted_date}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    {/* Ringkasan Tiket */}
                                    <div className="rounded-lg border-2 border-foreground bg-muted/40 p-3 space-y-2">
                                        <p className="font-mono text-xs font-bold uppercase text-muted-foreground">
                                            Ringkasan Tiket
                                        </p>
                                        {event.tickets
                                            .filter((t) => (selectedTickets[t.id] || 0) > 0)
                                            .map((t) => (
                                                <div key={t.id} className="flex justify-between items-center text-xs font-mono">
                                                    <span>
                                                        {t.name} x {selectedTickets[t.id]}
                                                    </span>
                                                    <span className="font-bold">
                                                        {formatPrice(t.price * selectedTickets[t.id])}
                                                    </span>
                                                </div>
                                            ))}
                                        <Separator className="border-foreground/30 my-2" />
                                        <div className="flex justify-between items-center font-mono font-bold text-sm">
                                            <span>Total Pembayaran:</span>
                                            <span className="text-primary">{formatPrice(totalPrice)}</span>
                                        </div>
                                    </div>

                                    {/* Form Data Pemesan */}
                                    <div className="space-y-3">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="buyer_name" className="text-xs font-mono">
                                                Nama Lengkap <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="buyer_name"
                                                value={buyerForm.name}
                                                onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                                                placeholder="Masukkan nama lengkap"
                                                className="border-2 border-foreground font-sans text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="buyer_email" className="text-xs font-mono">
                                                Email <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="buyer_email"
                                                type="email"
                                                value={buyerForm.email}
                                                onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                                                placeholder="nama@email.com"
                                                className="border-2 border-foreground font-sans text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="buyer_phone" className="text-xs font-mono">
                                                Nomor WhatsApp / Telepon <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="buyer_phone"
                                                type="tel"
                                                value={buyerForm.phone}
                                                onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                                                placeholder="08xxxxxxxxxx"
                                                className="border-2 border-foreground font-sans text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setCheckoutOpen(false)} className="font-mono text-xs">
                                        Batal
                                    </Button>
                                    <Button
                                        className="font-mono text-xs font-bold"
                                        onClick={handleConfirmOrder}
                                        disabled={!buyerForm.name.trim() || !buyerForm.email.trim() || !buyerForm.phone.trim()}
                                    >
                                        Konfirmasi Pemesanan
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <div className="space-y-4 py-6 text-center">
                                <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0_0_#000]">
                                    <CheckCircle2 className="size-8" />
                                </div>
                                <div>
                                    <h3 className="font-mono text-xl font-bold">Pemesanan Berhasil!</h3>
                                    <p className="mt-1 text-xs text-muted-foreground font-sans">
                                        Terima kasih <strong>{buyerForm.name}</strong>, tiket untuk <strong>{event.title}</strong> telah dipesan. Detail tiket telah dikonfirmasi dan dikirim ke <strong>{buyerForm.email}</strong>.
                                    </p>
                                </div>
                                <Button
                                    className="font-mono text-xs font-bold"
                                    onClick={() => {
                                        setCheckoutOpen(false);
                                        setSelectedTickets({});
                                    }}
                                >
                                    Tutup
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

