import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { useState, useEffect } from 'react';
import {
    Ticket,
    QrCode,
    BarChart3,
    Award,
    ShieldCheck,
    X,
    ArrowUpRight,
    Sparkles,
    Check,
    CreditCard,
    Zap,
    ChevronRight,
} from 'lucide-react';
import './welcome.css';

export default function Welcome() {
    const { auth } = usePage<{ auth: { user: { name: string } | null } }>().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'fitur' | 'solusi' | 'harga' | 'keunggulan'>('fitur');

    // Close mobile menu on Escape or when resizing back to landscape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                setDialogOpen(false);
            }
        };

        const handleResize = () => {
            if (window.innerWidth / window.innerHeight > 1.1) {
                setMenuOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const openFeatureModal = (tab: 'fitur' | 'solusi' | 'harga' | 'keunggulan' = 'fitur') => {
        setActiveTab(tab);
        setDialogOpen(true);
        setMenuOpen(false);
    };

    return (
        <>
            <Head title="Platform Event Management & Tiket Online #1 di Indonesia">
                <meta
                    name="description"
                    content="acarainaja.id — Infrastruktur modern untuk merancang, menjual tiket, dan menyelenggarakan event spektakuler dengan kendali penuh."
                />
            </Head>

            <div className={`cinematic-stage ${menuOpen ? 'is-open' : ''}`}>
                {/* ═══ BACKGROUND CLOUDFRONT VIDEO PLATE ═══ */}
                <div className="cinematic-plate" aria-hidden="true">
                    <video
                        className="cinematic-plate-video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                    >
                        <source
                            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4"
                            type="video/mp4"
                        />
                    </video>
                </div>

                {/* ═══ TOPBAR / HEADER ═══ */}
                <header className="cinematic-topbar">
                    {/* Brand Mark: Iconic Neobrutalist AI Badge + Brand Name */}
                    <Link href="/" className="cinematic-brand" aria-label="acarainaja.id Beranda">
                        <div className="cinematic-brand-box">
                            AI
                        </div>
                        <span className="cinematic-brand-text">
                            acarainaja.id
                        </span>
                    </Link>

                    {/* Centered Desktop Nav */}
                    <nav className="cinematic-links" aria-label="Navigasi Utama">
                        <button
                            type="button"
                            onClick={() => openFeatureModal('fitur')}
                            className="cinematic-nav-link"
                        >
                            FITUR
                        </button>
                        <button
                            type="button"
                            onClick={() => openFeatureModal('solusi')}
                            className="cinematic-nav-link"
                        >
                            SOLUSI
                        </button>
                        <button
                            type="button"
                            onClick={() => openFeatureModal('harga')}
                            className="cinematic-nav-link"
                        >
                            HARGA
                        </button>
                        <button
                            type="button"
                            onClick={() => openFeatureModal('keunggulan')}
                            className="cinematic-nav-link"
                        >
                            TENTANG
                        </button>
                    </nav>

                    {/* Desktop Right Pill CTA */}
                    {auth.user ? (
                        <Link href={dashboard()} className="cinematic-pill-nav">
                            DASHBOARD
                        </Link>
                    ) : (
                        <Link href={login()} className="cinematic-pill-nav">
                            MASUK
                        </Link>
                    )}

                    {/* Mobile Burger Button */}
                    <button
                        type="button"
                        className="cinematic-burger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle Menu"
                        aria-expanded={menuOpen}
                    >
                        <span className="cinematic-burger-bar" />
                        <span className="cinematic-burger-bar" />
                    </button>
                </header>

                {/* ═══ MOBILE FULLSCREEN MENU OVERLAY ═══ */}
                <nav className="cinematic-menu" aria-label="Mobile Navigation" aria-hidden={!menuOpen}>
                    <div>
                        <p className="cinematic-menu-eyebrow">✦ MENU NAVIGASI PLATFORM</p>
                        <ul className="cinematic-menu-list">
                            <li>
                                <button
                                    type="button"
                                    onClick={() => openFeatureModal('fitur')}
                                    className="cinematic-menu-link"
                                >
                                    <span>FITUR EVENT</span>
                                    <ArrowUpRight className="size-5" />
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => openFeatureModal('solusi')}
                                    className="cinematic-menu-link"
                                >
                                    <span>SOLUSI PENYELENGGARA</span>
                                    <ArrowUpRight className="size-5" />
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => openFeatureModal('harga')}
                                    className="cinematic-menu-link"
                                >
                                    <span>TRANSPARANSI BIAYA</span>
                                    <ArrowUpRight className="size-5" />
                                </button>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => openFeatureModal('keunggulan')}
                                    className="cinematic-menu-link"
                                >
                                    <span>TENTANG KAMI</span>
                                    <ArrowUpRight className="size-5" />
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="cinematic-menu-foot">
                        {auth.user ? (
                            <Link href={dashboard()} className="cinematic-pill-cta" onClick={() => setMenuOpen(false)}>
                                BUKA DASHBOARD
                            </Link>
                        ) : (
                            <>
                                <Link href={register()} className="cinematic-pill-cta" onClick={() => setMenuOpen(false)}>
                                    MULAI BUAT EVENT
                                </Link>
                                <Link href={login()} className="cinematic-ghost" onClick={() => setMenuOpen(false)}>
                                    MASUK KE AKUN
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* ═══ MAIN HERO STAGE ═══ */}
                <main className="cinematic-hero">
                    {/* Neobrutalist Badge */}
                    <div className="cinematic-badge">
                        <Sparkles className="size-3.5" />
                        <span>PLATFORM EVENT #1 DI INDONESIA</span>
                    </div>

                    <h1 className="cinematic-headline">
                        <span>PANGGUNG MASA DEPAN</span>
                        <span className="cinematic-headline-highlight">PENGALAMAN EVENT</span>
                    </h1>

                    <p className="cinematic-sub">
                        <span>Infrastruktur modern untuk merancang, menjual tiket,</span>
                        <span>dan menyelenggarakan event spektakuler dengan kendali penuh.</span>
                    </p>

                    <div className="cinematic-actions">
                        {auth.user ? (
                            <Link href={dashboard()} className="cinematic-pill-cta">
                                BUKA DASHBOARD
                                <ChevronRight className="size-5" />
                            </Link>
                        ) : (
                            <Link href={register()} className="cinematic-pill-cta">
                                MULAI SEKARANG
                                <ChevronRight className="size-5" />
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => openFeatureModal('fitur')}
                            className="cinematic-ghost"
                        >
                            <span>EKSPLORASI FITUR</span>
                            <ArrowUpRight className="size-4" />
                        </button>
                    </div>
                </main>

                {/* ═══ BOTTOM PARTNER STRIP ═══ */}
                <aside className="cinematic-logos" aria-label="Mitra & Komunitas Event">
                    <div className="cinematic-lg" title="Ticketing Infra">
                        <span className="size-2 rounded-full bg-emerald-400" />
                        <span className="cinematic-lg-word">#EVENTCON</span>
                    </div>

                    <div className="cinematic-lg" title="Stage Community">
                        <span className="size-2 rounded-full bg-amber-400" />
                        <span className="cinematic-lg-word">#FESTPULSE</span>
                    </div>

                    <div className="cinematic-lg" title="Live Productions">
                        <span className="size-2 rounded-full bg-blue-400" />
                        <span className="cinematic-lg-word">#STAGEFORGE</span>
                    </div>

                    <div className="cinematic-lg" title="Music & Gathering">
                        <span className="size-2 rounded-full bg-rose-400" />
                        <span className="cinematic-lg-word">#COMMUNITYX</span>
                    </div>
                </aside>

                {/* ═══ INTERACTIVE EVENT CAPABILITIES DIALOG ═══ */}
                {dialogOpen && (
                    <div
                        className="cinematic-dialog-overlay"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setDialogOpen(false);
                        }}
                    >
                        <div className="cinematic-dialog-card" role="dialog" aria-modal="true">
                            <button
                                type="button"
                                className="cinematic-dialog-close"
                                onClick={() => setDialogOpen(false)}
                                aria-label="Tutup Dialog"
                            >
                                <X className="size-5 stroke-[2.5]" />
                            </button>

                            {/* Header */}
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center border-2 border-white bg-primary font-mono font-bold text-white shadow-[3px_3px_0px_0px_#ffffff]">
                                    <Sparkles className="size-5" />
                                </div>
                                <div>
                                    <h2 className="font-mono text-xl font-black tracking-tight text-white sm:text-2xl">
                                        EKOSISTEM EVENT MODERN
                                    </h2>
                                    <p className="text-sm font-medium text-neutral-300">
                                        Solusi terpadu dari tahap publikasi hingga evaluasi pasca acara
                                    </p>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="mb-8 flex flex-wrap gap-2 border-b-2 border-white/20 pb-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('fitur')}
                                    className={`font-mono text-xs font-bold uppercase transition-all px-4 py-2 border-2 ${
                                        activeTab === 'fitur'
                                            ? 'bg-secondary text-black border-white shadow-[3px_3px_0px_0px_#ffffff] -translate-y-0.5'
                                            : 'bg-black/60 text-white border-white/40 hover:border-white hover:bg-black'
                                    }`}
                                >
                                    Fitur Unggulan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('solusi')}
                                    className={`font-mono text-xs font-bold uppercase transition-all px-4 py-2 border-2 ${
                                        activeTab === 'solusi'
                                            ? 'bg-secondary text-black border-white shadow-[3px_3px_0px_0px_#ffffff] -translate-y-0.5'
                                            : 'bg-black/60 text-white border-white/40 hover:border-white hover:bg-black'
                                    }`}
                                >
                                    Solusi Penyelenggara
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('harga')}
                                    className={`font-mono text-xs font-bold uppercase transition-all px-4 py-2 border-2 ${
                                        activeTab === 'harga'
                                            ? 'bg-secondary text-black border-white shadow-[3px_3px_0px_0px_#ffffff] -translate-y-0.5'
                                            : 'bg-black/60 text-white border-white/40 hover:border-white hover:bg-black'
                                    }`}
                                >
                                    Biaya & Transparansi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('keunggulan')}
                                    className={`font-mono text-xs font-bold uppercase transition-all px-4 py-2 border-2 ${
                                        activeTab === 'keunggulan'
                                            ? 'bg-secondary text-black border-white shadow-[3px_3px_0px_0px_#ffffff] -translate-y-0.5'
                                            : 'bg-black/60 text-white border-white/40 hover:border-white hover:bg-black'
                                    }`}
                                >
                                    Tentang Kami
                                </button>
                            </div>

                            {/* Tab 1: Fitur */}
                            {activeTab === 'fitur' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="border-2 border-white bg-black/80 p-5 shadow-[4px_4px_0px_0px_#ffffff] transition-transform hover:-translate-y-0.5">
                                        <div className="mb-3 flex size-10 items-center justify-center border-2 border-white bg-primary text-white shadow-[2px_2px_0px_0px_#ffffff]">
                                            <Ticket className="size-5" />
                                        </div>
                                        <h3 className="font-mono text-base font-black text-white">E-Ticketing Fleksibel</h3>
                                        <p className="mt-1 text-sm text-neutral-300 leading-relaxed">
                                            Dukungan multi-tier tiket (Gratis, Regular, Early Bird, VIP) dengan kontrol kuota instan dan voucher kupon diskon.
                                        </p>
                                    </div>

                                    <div className="border-2 border-white bg-black/80 p-5 shadow-[4px_4px_0px_0px_#ffffff] transition-transform hover:-translate-y-0.5">
                                        <div className="mb-3 flex size-10 items-center justify-center border-2 border-white bg-secondary text-black shadow-[2px_2px_0px_0px_#ffffff]">
                                            <QrCode className="size-5" />
                                        </div>
                                        <h3 className="font-mono text-base font-black text-white">QR Check-in Instan</h3>
                                        <p className="mt-1 text-sm text-neutral-300 leading-relaxed">
                                            Verifikasi kehadiran peserta di pintu masuk dalam hitungan detik menggunakan kamera smartphone tanpa antrean panjang.
                                        </p>
                                    </div>

                                    <div className="border-2 border-white bg-black/80 p-5 shadow-[4px_4px_0px_0px_#ffffff] transition-transform hover:-translate-y-0.5">
                                        <div className="mb-3 flex size-10 items-center justify-center border-2 border-white bg-accent text-accent-foreground shadow-[2px_2px_0px_0px_#ffffff]">
                                            <BarChart3 className="size-5" />
                                        </div>
                                        <h3 className="font-mono text-base font-black text-white">Dashboard & Analitik Real-Time</h3>
                                        <p className="mt-1 text-sm text-neutral-300 leading-relaxed">
                                            Pantau laju konversi, pendapatan tiket, dan grafik kehadiran pengunjung secara langsung melalui visual grafik interaktif.
                                        </p>
                                    </div>

                                    <div className="border-2 border-white bg-black/80 p-5 shadow-[4px_4px_0px_0px_#ffffff] transition-transform hover:-translate-y-0.5">
                                        <div className="mb-3 flex size-10 items-center justify-center border-2 border-white bg-primary text-white shadow-[2px_2px_0px_0px_#ffffff]">
                                            <Award className="size-5" />
                                        </div>
                                        <h3 className="font-mono text-base font-black text-white">E-Certificate Otomatis</h3>
                                        <p className="mt-1 text-sm text-neutral-300 leading-relaxed">
                                            Kirim sertifikat digital berpenomoran unik otomatis kepada peserta setelah status check-in terverifikasi di lokasi acara.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Solusi */}
                            {activeTab === 'solusi' && (
                                <div className="space-y-4">
                                    <div className="border-2 border-white bg-black/80 p-5 shadow-[4px_4px_0px_0px_#ffffff]">
                                        <h3 className="flex items-center gap-2 font-mono text-base font-black text-white">
                                            <Zap className="size-5 text-amber-400" />
                                            SEMINAR, WORKSHOP & KONFERENSI
                                        </h3>
                                        <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                                            Kelola agenda pembicara, absensi otomatis, distribusi materi, dan penerbitan sertifikat digital tanpa repot mencetak kertas.
                                        </p>
                                    </div>

                                    <div className="border-2 border-white bg-black/80 p-5 shadow-[4px_4px_0px_0px_#ffffff]">
                                        <h3 className="flex items-center gap-2 font-mono text-base font-black text-white">
                                            <Sparkles className="size-5 text-blue-400" />
                                            FESTIVAL, KONSER & EXHIBITION
                                        </h3>
                                        <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                                            Sistem penanganan lonjakan trafik pembelian tiket skala masif dengan perlindungan tiket ganda melalui enkripsi QR code sekali pakai.
                                        </p>
                                    </div>

                                    <div className="border-2 border-white bg-black/80 p-5 shadow-[4px_4px_0px_0px_#ffffff]">
                                        <h3 className="flex items-center gap-2 font-mono text-base font-black text-white">
                                            <ShieldCheck className="size-5 text-emerald-400" />
                                            GATEWAY PEMBAYARAN OTOMATIS
                                        </h3>
                                        <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                                            Terintegrasi dengan Midtrans untuk menerima pembayaran QRIS, Virtual Account bank, dan e-wallet secara instan dan aman.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Harga */}
                            {activeTab === 'harga' && (
                                <div className="space-y-6">
                                    <div className="border-2 border-white bg-black/80 p-6 text-center shadow-[6px_6px_0px_0px_#ffffff]">
                                        <span className="inline-block border-2 border-white bg-secondary px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#ffffff]">
                                            SEDERHANA & TRANSPARAN
                                        </span>
                                        <div className="mt-4 flex items-baseline justify-center gap-2">
                                            <span className="font-mono text-6xl font-black text-white">0%</span>
                                            <span className="font-mono text-sm font-bold text-neutral-300">untuk Event Gratis</span>
                                        </div>
                                        <p className="mt-2 text-sm text-neutral-300">
                                            Jika event Anda tidak memungut biaya tiket, seluruh fitur platform dapat digunakan 100% gratis tanpa batasan.
                                        </p>

                                        <div className="mt-6 border-t-2 border-white/20 pt-6">
                                            <div className="flex items-center justify-center gap-2 font-mono text-sm font-bold text-white">
                                                <CreditCard className="size-4 text-emerald-400" />
                                                HANYA 3% BIAYA PLATFORM UNTUK TIKET BERBAYAR
                                            </div>
                                            <p className="mt-1 text-xs text-neutral-400">
                                                Tanpa biaya langganan bulanan. Bayar hanya ketika Anda berhasil menjual tiket.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 font-mono text-xs text-neutral-200">
                                        <div className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-400" />
                                            <span>Unlimited peserta & event</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-400" />
                                            <span>Scan QR Scanner terintegrasi</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-400" />
                                            <span>Laporan pendapatan real-time</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="size-4 text-emerald-400" />
                                            <span>Export data peserta ke Excel/CSV</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Keunggulan */}
                            {activeTab === 'keunggulan' && (
                                <div className="space-y-4">
                                    <div className="border-2 border-white bg-black/80 p-5 shadow-[4px_4px_0px_0px_#ffffff]">
                                        <h3 className="font-mono text-base font-black text-white">TENTANG ACARAINAJA.ID</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                                            acarainaja.id didirikan dengan satu komitmen: menyederhanakan kompleksitas pengelolaan event. Mulai dari pembuat event komunitas hingga promotor festival berskala ribuan tiket, platform kami memberikan kendali presisi terhadap penjualan tiket, validasi pintu masuk, hingga pelaporan analitik keuangan.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="border-2 border-white bg-black/80 p-4 shadow-[3px_3px_0px_0px_#ffffff]">
                                            <div className="font-mono text-2xl font-black text-primary">99.9%</div>
                                            <div className="mt-1 font-mono text-xs font-bold text-neutral-300">UPTIME</div>
                                        </div>
                                        <div className="border-2 border-white bg-black/80 p-4 shadow-[3px_3px_0px_0px_#ffffff]">
                                            <div className="font-mono text-2xl font-black text-secondary">&lt; 1s</div>
                                            <div className="mt-1 font-mono text-xs font-bold text-neutral-300">SCAN QR</div>
                                        </div>
                                        <div className="border-2 border-white bg-black/80 p-4 shadow-[3px_3px_0px_0px_#ffffff]">
                                            <div className="font-mono text-2xl font-black text-accent">24/7</div>
                                            <div className="mt-1 font-mono text-xs font-bold text-neutral-300">SUPPORT</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Footer inside Modal */}
                            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t-2 border-white/20 pt-6 sm:flex-row">
                                <div className="font-mono text-xs text-neutral-300">
                                    Bergabung bersama 2,500+ pengelola event di Indonesia.
                                </div>
                                <div className="flex gap-3">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="border-2 border-white bg-primary px-5 py-2.5 font-mono text-xs font-bold text-white shadow-[3px_3px_0px_0px_#ffffff] transition-transform hover:-translate-y-0.5"
                                        >
                                            BUKA DASHBOARD
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={login()}
                                                className="border-2 border-white bg-black px-5 py-2.5 font-mono text-xs font-bold text-white shadow-[3px_3px_0px_0px_#ffffff] transition-transform hover:-translate-y-0.5"
                                            >
                                                MASUK
                                            </Link>
                                            <Link
                                                href={register()}
                                                className="border-2 border-white bg-secondary px-5 py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_0px_#ffffff] transition-transform hover:-translate-y-0.5"
                                            >
                                                DAFTAR SEKARANG
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
