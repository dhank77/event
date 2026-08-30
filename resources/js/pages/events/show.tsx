import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    Clock,
    Globe,
    MapPin,
    MonitorPlay,
    Tag,
    Ticket,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
    const isOffline = event.type === 'offline' || event.type === 'hybrid';
    const isOnline = event.type === 'online' || event.type === 'hybrid';

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
                            {/* EVENT DETAILS CARD */}
                            <Card className="sticky top-24 border-2 border-foreground shadow-[4px_4px_0_0_#000]">
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

                            {/* TICKETS CARD */}
                            <Card className="border-2 border-foreground shadow-[4px_4px_0_0_#000]">
                                <CardHeader className="bg-primary text-primary-foreground border-b-2 border-foreground pb-4">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="size-5" />
                                        <CardTitle className="font-mono text-xl">Pilih Tiket</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    {event.tickets.length > 0 ? (
                                        event.tickets.map((ticket) => (
                                            <div key={ticket.id} className="rounded-lg border-2 border-foreground p-4 transition-colors hover:bg-accent/20">
                                                <div className="mb-2 flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-mono font-bold">{ticket.name}</h4>
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
                                                    <Button size="sm" className="h-7 text-xs font-mono" disabled>Beli</Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                                            <Ticket className="mb-2 size-8 opacity-20" />
                                            <p className="text-sm">Tiket belum tersedia</p>
                                        </div>
                                    )}
                                </CardContent>
                                {event.tickets.length > 0 && (
                                    <CardFooter className="pt-0">
                                        <Button className="w-full font-mono text-sm" size="lg" disabled>
                                            Checkout Pembelian
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
