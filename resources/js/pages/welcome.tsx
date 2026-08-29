import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Globe,
    LayoutDashboard,
    Mail,
    MapPin,
    Menu,
    QrCode,
    Rocket,
    ScanLine,
    Shield,
    Sparkles,
    Star,
    Ticket,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

// ─── Data ───────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
    { label: 'Fitur', href: '#fitur' },
    { label: 'Event', href: '#event' },
    { label: 'Harga', href: '#harga' },
    { label: 'Tentang', href: '#tentang' },
];

const STATS = [
    { value: '10,000+', label: 'Event Dikelola' },
    { value: '500,000+', label: 'Peserta Terdaftar' },
    { value: '99.9%', label: 'Uptime' },
    { value: '50+', label: 'Kota di Indonesia' },
    { value: '4.9/5', label: 'Rating Pengguna' },
    { value: '24/7', label: 'Support' },
];

const FEATURES = [
    {
        icon: CalendarDays,
        title: 'Manajemen Event',
        description: 'Buat dan kelola event dengan mudah. Atur jadwal, lokasi, dan detail event dalam satu dashboard.',
        color: 'bg-secondary',
    },
    {
        icon: Ticket,
        title: 'Penjualan Tiket',
        description: 'Jual tiket online dengan berbagai tipe. Gratis, berbayar, early bird, hingga VIP.',
        color: 'bg-primary',
    },
    {
        icon: LayoutDashboard,
        title: 'Dashboard Analitik',
        description: 'Pantau performa event secara real-time. Data penjualan, demografi peserta, dan insight lainnya.',
        color: 'bg-accent',
    },
    {
        icon: Trophy,
        title: 'E-Certificate',
        description: 'Generate sertifikat digital otomatis untuk setiap peserta yang hadir di event kamu.',
        color: 'bg-secondary',
    },
    {
        icon: QrCode,
        title: 'QR Check-in',
        description: 'Check-in peserta dengan scan QR code. Cepat, akurat, dan tanpa antrian panjang.',
        color: 'bg-primary',
    },
    {
        icon: CreditCard,
        title: 'Integrasi Pembayaran',
        description: 'Terima pembayaran via transfer bank, e-wallet, dan kartu kredit secara otomatis.',
        color: 'bg-accent',
    },
];

const STEPS = [
    {
        step: '01',
        title: 'Buat Event',
        description: 'Daftarkan event kamu dalam hitungan menit. Isi detail, upload banner, dan atur tiket.',
        icon: Sparkles,
    },
    {
        step: '02',
        title: 'Bagikan & Jual',
        description: 'Sebarkan link event ke media sosial. Peserta bisa langsung daftar dan bayar online.',
        icon: Globe,
    },
    {
        step: '03',
        title: 'Kelola & Analisis',
        description: 'Pantau pendaftaran, kelola peserta, dan dapatkan laporan lengkap setelah event.',
        icon: Zap,
    },
];

const EVENTS = [
    {
        title: 'Tech Conference 2026',
        date: '15 Sep 2026',
        location: 'Jakarta Convention Center',
        attendees: 2500,
        price: 'Rp 250.000',
        category: 'Teknologi',
        bgColor: 'bg-secondary',
    },
    {
        title: 'Music Festival Bali',
        date: '22 Okt 2026',
        location: 'GWK Cultural Park, Bali',
        attendees: 10000,
        price: 'Rp 500.000',
        category: 'Musik',
        bgColor: 'bg-primary',
    },
    {
        title: 'Startup Networking Night',
        date: '5 Nov 2026',
        location: 'Block71, Yogyakarta',
        attendees: 300,
        price: 'Gratis',
        category: 'Bisnis',
        bgColor: 'bg-accent',
    },
];

const PRICING = [
    {
        name: 'Gratis',
        price: 'Rp 0',
        period: 'selamanya',
        description: 'Untuk event kecil dan personal',
        features: ['Hingga 100 peserta', '1 event aktif', 'QR Check-in', 'E-Ticket dasar', 'Laporan sederhana'],
        cta: 'Mulai Gratis',
        variant: 'outline' as const,
        popular: false,
        bgColor: 'bg-card',
    },
    {
        name: 'Pro',
        price: 'Rp 299.000',
        period: '/bulan',
        description: 'Untuk organizer profesional',
        features: [
            'Peserta unlimited',
            'Event unlimited',
            'QR Check-in',
            'E-Certificate',
            'Dashboard analitik lengkap',
            'Custom branding',
            'Priority support',
        ],
        cta: 'Coba Pro',
        variant: 'default' as const,
        popular: true,
        bgColor: 'bg-secondary',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'Untuk perusahaan & organisasi besar',
        features: [
            'Semua fitur Pro',
            'SSO & team management',
            'API access',
            'Dedicated account manager',
            'SLA 99.99%',
            'White-label solution',
            'On-premise deployment',
        ],
        cta: 'Hubungi Sales',
        variant: 'outline' as const,
        popular: false,
        bgColor: 'bg-card',
    },
];

const TESTIMONIALS = [
    {
        name: 'Rina Aulia',
        role: 'Event Organizer, TEDxJakarta',
        quote: 'acarainaja.id mengubah cara kami mengelola event. Dari registrasi hingga check-in, semuanya jadi seamless. Peserta kami juga sangat terbantu!',
        avatar: 'RA',
        color: 'bg-secondary',
    },
    {
        name: 'Budi Santoso',
        role: 'CEO, StartupWeekend ID',
        quote: 'Dashboard analitiknya luar biasa. Kami bisa melihat data real-time dan membuat keputusan yang lebih baik untuk event-event kami selanjutnya.',
        avatar: 'BS',
        color: 'bg-primary',
    },
    {
        name: 'Maya Putri',
        role: 'Community Lead, GDG Bandung',
        quote: 'Fitur e-certificate otomatis menghemat waktu kami berjam-jam. Plus, integrasi pembayarannya sangat mudah digunakan. Highly recommended!',
        avatar: 'MP',
        color: 'bg-accent',
    },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export default function Welcome() {
    const { auth } = usePage<{ auth: { user: { name: string } | null } }>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="Platform Event Management #1 di Indonesia">
                <meta
                    name="description"
                    content="acarainaja.id — Platform event management terlengkap di Indonesia. Kelola event, jual tiket, dan analisis performa event kamu dalam satu platform."
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                {/* ═══ NAVBAR ═══ */}
                <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center border-2 border-foreground bg-primary font-mono text-sm font-bold text-primary-foreground shadow-sm">
                                AI
                            </div>
                            <span className="font-mono text-lg font-bold tracking-tight">acarainaja.id</span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden items-center gap-1 md:flex">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden items-center gap-3 md:flex">
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={register()}>
                                            Daftar
                                            <ChevronRight data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="md:hidden">
                                    <Menu />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[280px]">
                                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                                <div className="flex flex-col gap-4 pt-8">
                                    {NAV_LINKS.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            className="border-b border-border px-2 pb-3 text-lg font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                    <Separator />
                                    {auth.user ? (
                                        <Button asChild className="w-full">
                                            <Link href={dashboard()}>Dashboard</Link>
                                        </Button>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Button variant="outline" asChild className="w-full">
                                                <Link href={login()}>Masuk</Link>
                                            </Button>
                                            <Button asChild className="w-full">
                                                <Link href={register()}>Daftar Sekarang</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </nav>
                </header>

                {/* ═══ HERO ═══ */}
                <section className="relative overflow-hidden border-b-2 border-foreground">
                    {/* Background pattern */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }} />

                    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                            {/* Left Content */}
                            <div className="relative z-10 flex flex-col gap-6">
                                <Badge variant="secondary" className="w-fit px-3 py-1 font-mono text-xs uppercase">
                                    <Rocket data-icon="inline-start" />
                                    Platform Event #1 di Indonesia
                                </Badge>

                                <h1 className="font-mono text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                                    Kelola Event{' '}
                                    <span className="relative inline-block">
                                        <span className="relative z-10">Tanpa Ribet</span>
                                        <span className="absolute bottom-1 left-0 -z-0 h-4 w-full bg-secondary sm:bottom-2 sm:h-5" />
                                    </span>
                                </h1>

                                <p className="max-w-lg text-lg text-muted-foreground">
                                    Dari pembuatan event, penjualan tiket, hingga check-in peserta —
                                    semuanya bisa kamu kelola dalam satu platform yang simpel dan powerful.
                                </p>

                                <div className="flex flex-wrap gap-3">
                                    <Button size="lg" asChild className="text-base font-semibold">
                                        <Link href={register()}>
                                            Mulai Sekarang
                                            <ChevronRight data-icon="inline-end" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="text-base font-semibold">
                                        Lihat Demo
                                    </Button>
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex -space-x-2">
                                        {['bg-primary', 'bg-secondary', 'bg-accent', 'bg-primary'].map((bg, i) => (
                                            <div
                                                key={i}
                                                className={`flex size-8 items-center justify-center border-2 border-foreground ${bg} text-xs font-bold`}
                                            >
                                                {['A', 'B', 'C', 'D'][i]}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold">2,500+</span>{' '}
                                        <span className="text-muted-foreground">organizer bergabung</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Floating Cards */}
                            <div className="relative hidden lg:block">
                                {/* Main card */}
                                <div className="animate-float">
                                    <Card className="neo-lift border-2 border-foreground bg-secondary shadow-md">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-mono">
                                                <CalendarDays className="size-5" />
                                                Tech Conference 2026
                                            </CardTitle>
                                            <CardDescription>Jakarta Convention Center</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Peserta</span>
                                                    <span className="font-mono font-bold">2,500 / 3,000</span>
                                                </div>
                                                <div className="h-3 w-full border-2 border-foreground bg-muted">
                                                    <div className="h-full w-[83%] bg-primary" />
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Revenue</span>
                                                    <span className="font-mono font-bold text-primary">Rp 625 Juta</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Small floating card */}
                                <div className="animate-float-delay absolute -bottom-4 -left-8">
                                    <Card className="neo-lift border-2 border-foreground bg-accent p-4 text-accent-foreground shadow-md">
                                        <div className="flex items-center gap-3">
                                            <ScanLine className="size-8" />
                                            <div>
                                                <p className="font-mono text-sm font-bold">Check-in!</p>
                                                <p className="text-xs opacity-80">Budi just checked in</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Badge floating */}
                                <div className="animate-float absolute -top-4 right-8" style={{ animationDelay: '1s' }}>
                                    <Card className="neo-lift border-2 border-foreground bg-primary p-3 text-primary-foreground shadow-md">
                                        <div className="flex items-center gap-2">
                                            <Star className="size-5" />
                                            <span className="font-mono text-sm font-bold">4.9 Rating</span>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ STATS MARQUEE ═══ */}
                <section className="overflow-hidden border-b-2 border-foreground bg-foreground py-4 text-background">
                    <div className="flex animate-marquee whitespace-nowrap">
                        {[...STATS, ...STATS].map((stat, i) => (
                            <div key={i} className="mx-8 flex items-center gap-3 sm:mx-12">
                                <span className="font-mono text-xl font-black sm:text-2xl">{stat.value}</span>
                                <span className="text-sm opacity-70">{stat.label}</span>
                                <span className="text-muted-foreground">✦</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ═══ FEATURES ═══ */}
                <section id="fitur" className="border-b-2 border-foreground py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase">
                                <Zap data-icon="inline-start" />
                                Fitur Lengkap
                            </Badge>
                            <h2 className="font-mono text-3xl font-black tracking-tight sm:text-4xl">
                                Semua yang Kamu Butuhkan
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Tools lengkap untuk mengelola event dari A sampai Z. Fokus ke event-mu, biar platform-nya kami yang urus.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {FEATURES.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <Card
                                        key={feature.title}
                                        className={`neo-lift border-2 border-foreground ${feature.color} shadow-md`}
                                    >
                                        <CardHeader>
                                            <div className="mb-2 flex size-12 items-center justify-center border-2 border-foreground bg-background shadow-sm">
                                                <Icon className="size-6" />
                                            </div>
                                            <CardTitle className="font-mono text-lg">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-sm leading-relaxed">
                                                {feature.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══ HOW IT WORKS ═══ */}
                <section className="border-b-2 border-foreground bg-muted py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase">
                                <Sparkles data-icon="inline-start" />
                                Cara Kerja
                            </Badge>
                            <h2 className="font-mono text-3xl font-black tracking-tight sm:text-4xl">
                                Mudah, Cepat, 3 Langkah!
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Tidak perlu ribet. Mulai kelola event kamu hanya dalam 3 langkah sederhana.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {STEPS.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.step} className="relative">
                                        <Card className="neo-lift relative border-2 border-foreground bg-card shadow-md">
                                            <CardHeader>
                                                <span className="font-mono text-5xl font-black text-primary/20">
                                                    {step.step}
                                                </span>
                                                <div className="mt-2 flex size-12 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-sm">
                                                    <Icon className="size-6" />
                                                </div>
                                                <CardTitle className="mt-4 font-mono text-xl">{step.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="text-sm leading-relaxed">
                                                    {step.description}
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══ POPULAR EVENTS ═══ */}
                <section id="event" className="border-b-2 border-foreground py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase">
                                <Star data-icon="inline-start" />
                                Event Populer
                            </Badge>
                            <h2 className="font-mono text-3xl font-black tracking-tight sm:text-4xl">
                                Event yang Sedang Trending
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Temukan event-event menarik yang dikelola menggunakan platform kami.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {EVENTS.map((event) => (
                                <Card
                                    key={event.title}
                                    className="neo-lift overflow-hidden border-2 border-foreground shadow-md"
                                >
                                    {/* Event image placeholder */}
                                    <div className={`relative h-48 ${event.bgColor} border-b-2 border-foreground`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <CalendarDays className="size-16 opacity-20" />
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="absolute top-3 left-3 border-2 border-foreground font-mono text-xs"
                                        >
                                            {event.category}
                                        </Badge>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="font-mono text-lg">{event.title}</CardTitle>
                                        <CardDescription className="flex flex-col gap-1.5">
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
                                            <span>{event.attendees.toLocaleString('id-ID')}</span>
                                        </div>
                                        <span className="font-mono text-lg font-bold text-primary">{event.price}</span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-center">
                            <Button variant="outline" size="lg" className="font-mono">
                                Lihat Semua Event
                                <ChevronRight data-icon="inline-end" />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ═══ PRICING ═══ */}
                <section id="harga" className="border-b-2 border-foreground bg-muted py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase">
                                <CreditCard data-icon="inline-start" />
                                Harga
                            </Badge>
                            <h2 className="font-mono text-3xl font-black tracking-tight sm:text-4xl">
                                Pilih Paket yang Tepat
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Mulai gratis, upgrade kapan saja. Tanpa biaya tersembunyi.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {PRICING.map((plan) => (
                                <Card
                                    key={plan.name}
                                    className={`neo-lift relative border-2 border-foreground ${plan.bgColor} shadow-md ${plan.popular ? 'scale-[1.02] lg:scale-105' : ''}`}
                                >
                                    {plan.popular && (
                                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-foreground px-4 font-mono text-xs uppercase">
                                            Paling Populer
                                        </Badge>
                                    )}
                                    <CardHeader className="pt-8">
                                        <CardTitle className="font-mono text-xl">{plan.name}</CardTitle>
                                        <CardDescription>{plan.description}</CardDescription>
                                        <div className="pt-2">
                                            <span className="font-mono text-4xl font-black">{plan.price}</span>
                                            {plan.period && (
                                                <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="flex flex-col gap-3">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant={plan.variant} className="w-full font-mono" size="lg" asChild>
                                            <Link href={register()}>
                                                {plan.cta}
                                                <ChevronRight data-icon="inline-end" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ TESTIMONIALS ═══ */}
                <section id="tentang" className="border-b-2 border-foreground py-20 sm:py-28">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto mb-16 max-w-2xl text-center">
                            <Badge variant="outline" className="mb-4 font-mono text-xs uppercase">
                                <Users data-icon="inline-start" />
                                Testimonial
                            </Badge>
                            <h2 className="font-mono text-3xl font-black tracking-tight sm:text-4xl">
                                Dipercaya Ribuan Organizer
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Dengar langsung dari para event organizer yang sudah menggunakan platform kami.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {TESTIMONIALS.map((testimonial) => (
                                <Card
                                    key={testimonial.name}
                                    className="neo-lift border-2 border-foreground shadow-md"
                                >
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex size-12 items-center justify-center border-2 border-foreground ${testimonial.color} font-mono text-sm font-bold shadow-sm`}
                                            >
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm">{testimonial.name}</CardTitle>
                                                <CardDescription className="text-xs">{testimonial.role}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-0.5 pb-3">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className="size-4 fill-secondary text-secondary" />
                                            ))}
                                        </div>
                                        <p className="text-sm leading-relaxed text-muted-foreground italic">
                                            &ldquo;{testimonial.quote}&rdquo;
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ CTA ═══ */}
                <section className="border-b-2 border-foreground bg-primary py-20 text-primary-foreground sm:py-28">
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="font-mono text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                            Siap Buat Event Pertamamu?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
                            Bergabung dengan 2,500+ event organizer yang sudah mempercayakan event mereka pada acarainaja.id.
                            Gratis untuk memulai!
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="border-2 border-foreground font-mono text-base font-bold shadow-md"
                                asChild
                            >
                                <Link href={register()}>
                                    Daftar Sekarang — Gratis!
                                    <Rocket data-icon="inline-end" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-2 border-primary-foreground bg-transparent font-mono text-base font-bold text-primary-foreground shadow-none hover:bg-primary-foreground/10"
                            >
                                <Mail data-icon="inline-start" />
                                Hubungi Kami
                            </Button>
                        </div>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm opacity-80">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="size-4" />
                                Tanpa kartu kredit
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="size-4" />
                                Setup 5 menit
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Shield className="size-4" />
                                Data aman & terenkripsi
                            </span>
                        </div>
                    </div>
                </section>

                {/* ═══ FOOTER ═══ */}
                <footer className="bg-foreground py-16 text-background">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Brand */}
                            <div className="flex flex-col gap-4 lg:col-span-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-9 items-center justify-center border-2 border-background bg-primary font-mono text-sm font-bold text-primary-foreground">
                                        AI
                                    </div>
                                    <span className="font-mono text-lg font-bold">acarainaja.id</span>
                                </div>
                                <p className="text-sm opacity-70">
                                    Platform event management terlengkap di Indonesia. Kelola event, jual tiket, dan analisis performa event kamu.
                                </p>
                            </div>

                            {/* Product */}
                            <div className="flex flex-col gap-3">
                                <h4 className="font-mono text-sm font-bold uppercase tracking-wider">Produk</h4>
                                <a href="#fitur" className="text-sm opacity-70 transition-opacity hover:opacity-100">Fitur</a>
                                <a href="#harga" className="text-sm opacity-70 transition-opacity hover:opacity-100">Harga</a>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">Integrasi</a>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">API Docs</a>
                            </div>

                            {/* Company */}
                            <div className="flex flex-col gap-3">
                                <h4 className="font-mono text-sm font-bold uppercase tracking-wider">Perusahaan</h4>
                                <a href="#tentang" className="text-sm opacity-70 transition-opacity hover:opacity-100">Tentang Kami</a>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">Blog</a>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">Karir</a>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">Kontak</a>
                            </div>

                            {/* Legal */}
                            <div className="flex flex-col gap-3">
                                <h4 className="font-mono text-sm font-bold uppercase tracking-wider">Legal</h4>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">Kebijakan Privasi</a>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">Syarat & Ketentuan</a>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">Refund Policy</a>
                                <a href="#" className="text-sm opacity-70 transition-opacity hover:opacity-100">Security</a>
                            </div>
                        </div>

                        <Separator className="my-8 bg-background/20" />

                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <p className="text-sm opacity-60">
                                &copy; {new Date().getFullYear()} acarainaja.id. All rights reserved.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="text-sm opacity-60 transition-opacity hover:opacity-100">
                                    Instagram
                                </a>
                                <a href="#" className="text-sm opacity-60 transition-opacity hover:opacity-100">
                                    Twitter
                                </a>
                                <a href="#" className="text-sm opacity-60 transition-opacity hover:opacity-100">
                                    LinkedIn
                                </a>
                                <a href="#" className="text-sm opacity-60 transition-opacity hover:opacity-100">
                                    YouTube
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
