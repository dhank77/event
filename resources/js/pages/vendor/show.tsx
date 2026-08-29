import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    CalendarDays,
    ChevronRight,
    Globe,
    Instagram,
    MapPin,
    Share2,
    Star,
    Ticket,
    Twitter,
    Users,
} from 'lucide-react';

type VendorProps = {
    vendor: {
        name: string;
        username: string;
        role: string;
        joined: string;
    };
};

// Static event data for the vendor profile
const VENDOR_EVENTS = [
    {
        id: 1,
        title: 'Workshop UI/UX Design',
        date: '20 Sep 2026',
        location: 'Online via Zoom',
        attendees: 150,
        price: 'Rp 75.000',
        category: 'Workshop',
        bgColor: 'bg-secondary',
        status: 'upcoming',
    },
    {
        id: 2,
        title: 'Community Meetup #12',
        date: '5 Okt 2026',
        location: 'Kopikenangan, Jakarta',
        attendees: 45,
        price: 'Gratis',
        category: 'Meetup',
        bgColor: 'bg-accent',
        status: 'upcoming',
    },
    {
        id: 3,
        title: 'Seminar Digital Marketing',
        date: '10 Agu 2026',
        location: 'Auditorium UI, Depok',
        attendees: 320,
        price: 'Rp 50.000',
        category: 'Seminar',
        bgColor: 'bg-primary',
        status: 'past',
    },
];

const VENDOR_STATS = [
    { label: 'Event', value: '12' },
    { label: 'Peserta', value: '2,350' },
    { label: 'Rating', value: '4.8' },
];

export default function VendorShow({ vendor }: VendorProps) {
    const upcomingEvents = VENDOR_EVENTS.filter((e) => e.status === 'upcoming');
    const pastEvents = VENDOR_EVENTS.filter((e) => e.status === 'past');

    return (
        <>
            <Head title={`${vendor.name} (@${vendor.username})`}>
                <meta
                    name="description"
                    content={`Lihat profil dan event dari ${vendor.name} di acarainaja.id`}
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                {/* ═══ NAVBAR ═══ */}
                <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center border-2 border-foreground bg-primary font-mono text-sm font-bold text-primary-foreground shadow-sm">
                                AI
                            </div>
                            <span className="font-mono text-lg font-bold tracking-tight">acarainaja.id</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="font-mono">
                                <Share2 data-icon="inline-start" />
                                Bagikan
                            </Button>
                        </div>
                    </nav>
                </header>

                {/* ═══ VENDOR HERO ═══ */}
                <section className="border-b-2 border-foreground">
                    {/* Cover banner */}
                    <div className="h-32 bg-primary sm:h-44 lg:h-52">
                        <div className="pointer-events-none h-full w-full opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }} />
                    </div>

                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="relative -mt-16 flex flex-col gap-6 pb-8 sm:-mt-20 sm:flex-row sm:items-end sm:gap-8">
                            {/* Avatar */}
                            <div className="flex size-28 shrink-0 items-center justify-center border-4 border-foreground bg-secondary font-mono text-4xl font-black shadow-md sm:size-36">
                                {vendor.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex flex-1 flex-col gap-2 sm:pb-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="font-mono text-2xl font-black sm:text-3xl">{vendor.name}</h1>
                                    <Badge variant="secondary" className="border-2 border-foreground font-mono text-xs uppercase">
                                        {vendor.role === 'vendor' ? 'Event Organizer' : vendor.role}
                                    </Badge>
                                </div>
                                <p className="font-mono text-muted-foreground">@{vendor.username}</p>
                                <p className="text-sm text-muted-foreground">
                                    Bergabung sejak {vendor.joined}
                                </p>
                            </div>

                            {/* Social links (static) */}
                            <div className="flex gap-2 sm:pb-2">
                                <Button variant="outline" size="icon" className="border-2 border-foreground">
                                    <Instagram />
                                </Button>
                                <Button variant="outline" size="icon" className="border-2 border-foreground">
                                    <Twitter />
                                </Button>
                                <Button variant="outline" size="icon" className="border-2 border-foreground">
                                    <Globe />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ STATS BAR ═══ */}
                <section className="border-b-2 border-foreground bg-foreground py-4 text-background">
                    <div className="mx-auto flex max-w-5xl items-center justify-center gap-8 px-4 sm:gap-16 sm:px-6 lg:px-8">
                        {VENDOR_STATS.map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center gap-1">
                                <span className="font-mono text-2xl font-black sm:text-3xl">{stat.value}</span>
                                <span className="text-xs opacity-70 sm:text-sm">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ═══ BIO ═══ */}
                <section className="border-b-2 border-foreground py-8">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <Card className="border-2 border-foreground shadow-md">
                            <CardHeader>
                                <CardTitle className="font-mono text-lg">Tentang</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Event organizer profesional yang berfokus pada event teknologi, workshop,
                                    dan community meetup. Berpengalaman mengelola berbagai event dengan ribuan
                                    peserta di seluruh Indonesia.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* ═══ UPCOMING EVENTS ═══ */}
                <section className="border-b-2 border-foreground py-12 sm:py-16">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-mono text-xl font-black sm:text-2xl">
                                Event Mendatang
                            </h2>
                            <Badge variant="outline" className="font-mono text-xs">
                                {upcomingEvents.length} event
                            </Badge>
                        </div>

                        {upcomingEvents.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {upcomingEvents.map((event) => (
                                    <Card
                                        key={event.id}
                                        className="neo-lift overflow-hidden border-2 border-foreground shadow-md"
                                    >
                                        <div className={`relative h-36 ${event.bgColor} border-b-2 border-foreground`}>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <CalendarDays className="size-12 opacity-20" />
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="absolute top-3 left-3 border-2 border-foreground font-mono text-xs"
                                            >
                                                {event.category}
                                            </Badge>
                                            <Badge
                                                className="absolute top-3 right-3 border-2 border-foreground bg-secondary text-secondary-foreground font-mono text-xs"
                                            >
                                                Akan Datang
                                            </Badge>
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="font-mono">{event.title}</CardTitle>
                                            <CardDescription className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarDays className="size-3.5" />
                                                    {event.date}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="size-3.5" />
                                                    {event.location}
                                                </span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardFooter className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Users className="size-4" />
                                                <span>{event.attendees}</span>
                                            </div>
                                            <span className="font-mono text-lg font-bold text-primary">{event.price}</span>
                                        </CardFooter>
                                        <div className="px-6 pb-6">
                                            <Button className="w-full font-mono" size="lg">
                                                <Ticket data-icon="inline-start" />
                                                Daftar Sekarang
                                                <ChevronRight data-icon="inline-end" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-2 border-foreground bg-muted p-12 text-center shadow-md">
                                <p className="text-muted-foreground">Belum ada event mendatang</p>
                            </Card>
                        )}
                    </div>
                </section>

                {/* ═══ PAST EVENTS ═══ */}
                <section className="border-b-2 border-foreground bg-muted py-12 sm:py-16">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="font-mono text-xl font-black sm:text-2xl">
                                Event Sebelumnya
                            </h2>
                            <Badge variant="outline" className="font-mono text-xs">
                                {pastEvents.length} event
                            </Badge>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {pastEvents.map((event) => (
                                <Card
                                    key={event.id}
                                    className="neo-lift overflow-hidden border-2 border-foreground opacity-80 shadow-md"
                                >
                                    <div className={`relative h-28 ${event.bgColor} border-b-2 border-foreground`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <CalendarDays className="size-10 opacity-20" />
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="absolute top-3 left-3 border-2 border-foreground font-mono text-xs"
                                        >
                                            {event.category}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="absolute top-3 right-3 border-2 border-foreground bg-background font-mono text-xs"
                                        >
                                            Selesai
                                        </Badge>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="font-mono text-sm">{event.title}</CardTitle>
                                        <CardDescription className="flex flex-col gap-1 text-xs">
                                            <span className="flex items-center gap-1.5">
                                                <CalendarDays className="size-3" />
                                                {event.date}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Users className="size-3" />
                                                {event.attendees} peserta
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ REVIEW SUMMARY ═══ */}
                <section className="border-b-2 border-foreground py-12 sm:py-16">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <h2 className="mb-8 font-mono text-xl font-black sm:text-2xl">
                            Ulasan Peserta
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    name: 'Sari Dewi',
                                    rating: 5,
                                    text: 'Event-nya sangat terorganisir! Materi workshop sangat bermanfaat dan pembicaranya keren banget.',
                                    event: 'Workshop UI/UX Design',
                                    avatar: 'SD',
                                    color: 'bg-secondary',
                                },
                                {
                                    name: 'Andi Pratama',
                                    rating: 5,
                                    text: 'Meetup-nya seru! Bisa networking dengan banyak orang baru. Pasti ikut lagi next time.',
                                    event: 'Community Meetup #11',
                                    avatar: 'AP',
                                    color: 'bg-accent',
                                },
                                {
                                    name: 'Lisa Kurniawan',
                                    rating: 4,
                                    text: 'Materinya bagus dan relevan. Semoga bisa ada sesi yang lebih panjang untuk praktik langsung.',
                                    event: 'Seminar Digital Marketing',
                                    avatar: 'LK',
                                    color: 'bg-primary',
                                },
                            ].map((review) => (
                                <Card key={review.name} className="neo-lift border-2 border-foreground shadow-md">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex size-10 items-center justify-center border-2 border-foreground ${review.color} font-mono text-xs font-bold shadow-sm`}
                                            >
                                                {review.avatar}
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm">{review.name}</CardTitle>
                                                <CardDescription className="text-xs">{review.event}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-0.5 pb-2">
                                            {Array.from({ length: review.rating }).map((_, i) => (
                                                <Star key={i} className="size-3.5 fill-secondary text-secondary" />
                                            ))}
                                        </div>
                                        <p className="text-sm leading-relaxed text-muted-foreground italic">
                                            &ldquo;{review.text}&rdquo;
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ FOOTER ═══ */}
                <footer className="bg-foreground py-8 text-background">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex size-7 items-center justify-center border-2 border-background bg-primary font-mono text-xs font-bold text-primary-foreground">
                                    AI
                                </div>
                                <span className="font-mono text-sm font-bold">acarainaja.id</span>
                            </div>
                            <p className="text-xs opacity-60">
                                &copy; {new Date().getFullYear()} acarainaja.id. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
