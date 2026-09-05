import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    Receipt,
    Ticket,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type OrderItem = {
    ticket_name: string;
    ticket_tier: string;
    price: number;
    quantity: number;
    subtotal: number;
};

type OrderData = {
    order_number: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    total_price: number;
    status: 'pending' | 'paid' | 'cancelled' | 'expired';
    payment_type: string | null;
    snap_redirect_url: string | null;
    event: {
        title: string;
        slug: string;
    };
    items: OrderItem[];
};

interface OrderShowProps {
    order: OrderData;
}

const statusConfig = {
    paid: {
        icon: CheckCircle2,
        label: 'Pembayaran Berhasil',
        description: 'Tiket Anda telah dikonfirmasi. Terima kasih!',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
        badgeVariant: 'default' as const,
    },
    pending: {
        icon: Clock,
        label: 'Menunggu Pembayaran',
        description: 'Selesaikan pembayaran Anda sebelum batas waktu habis.',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
        badgeVariant: 'secondary' as const,
    },
    cancelled: {
        icon: XCircle,
        label: 'Pembayaran Dibatalkan',
        description: 'Transaksi ini telah dibatalkan atau ditolak.',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
        badgeVariant: 'destructive' as const,
    },
    expired: {
        icon: AlertCircle,
        label: 'Pembayaran Kedaluwarsa',
        description: 'Batas waktu pembayaran telah habis.',
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800',
        badgeVariant: 'outline' as const,
    },
};

export default function OrderShow({ order }: OrderShowProps) {
    const config = statusConfig[order.status];
    const StatusIcon = config.icon;

    // Auto-redirect to Midtrans for pending paid orders
    useEffect(() => {
        if (order.status === 'pending' && order.snap_redirect_url) {
            window.location.href = order.snap_redirect_url;
        }
    }, [order.status, order.snap_redirect_url]);

    const formatPrice = (price: number) => {
        if (price === 0) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <>
            <Head title={`Order ${order.order_number} — ${order.event.title}`} />

            <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
                {/* NAVBAR */}
                <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <nav className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center border-2 border-foreground bg-primary font-mono text-sm font-bold text-primary-foreground shadow-sm">
                                AI
                            </div>
                            <span className="font-mono text-lg font-bold tracking-tight">acarainaja.id</span>
                        </Link>
                    </nav>
                </header>

                <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                    <div className="space-y-6">
                        {/* STATUS BANNER */}
                        <div className={`rounded-xl border-2 p-6 text-center ${config.bg}`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className={`flex size-16 items-center justify-center rounded-full border-2 border-current shadow-[2px_2px_0_0_currentColor] ${config.color}`}>
                                    <StatusIcon className="size-8" />
                                </div>
                                <div>
                                    <h1 className={`font-mono text-2xl font-black ${config.color}`}>
                                        {config.label}
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {config.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ORDER DETAIL CARD */}
                        <Card className="border-2 border-foreground shadow-[4px_4px_0_0_#000]">
                            <CardHeader className="border-b-2 border-foreground bg-muted/40 pb-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Receipt className="size-5" />
                                        <CardTitle className="font-mono text-lg">Detail Pesanan</CardTitle>
                                    </div>
                                    <Badge variant={config.badgeVariant} className="font-mono text-xs uppercase">
                                        {order.status}
                                    </Badge>
                                </div>
                                <p className="font-mono text-xs text-muted-foreground">
                                    #{order.order_number}
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-5 pt-5">
                                {/* Event */}
                                <div>
                                    <p className="font-mono text-xs font-bold uppercase text-muted-foreground mb-1">
                                        Event
                                    </p>
                                    <p className="font-mono font-bold">{order.event.title}</p>
                                </div>

                                <Separator className="border-foreground/20" />

                                {/* Buyer info */}
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <p className="font-mono text-xs font-bold uppercase text-muted-foreground mb-1">Nama</p>
                                        <p className="font-sans text-sm">{order.buyer_name}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs font-bold uppercase text-muted-foreground mb-1">Email</p>
                                        <p className="font-sans text-sm">{order.buyer_email}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-xs font-bold uppercase text-muted-foreground mb-1">Telepon</p>
                                        <p className="font-sans text-sm">{order.buyer_phone}</p>
                                    </div>
                                </div>

                                <Separator className="border-foreground/20" />

                                {/* Items */}
                                <div>
                                    <p className="font-mono text-xs font-bold uppercase text-muted-foreground mb-3">
                                        Tiket yang Dipesan
                                    </p>
                                    <div className="space-y-2">
                                        {order.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border-2 border-foreground/30 bg-muted/20 px-4 py-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Ticket className="size-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-mono text-sm font-bold">{item.ticket_name}</p>
                                                        <p className="font-mono text-xs uppercase text-muted-foreground">
                                                            {item.ticket_tier} · {formatPrice(item.price)} × {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-mono font-bold text-primary">
                                                    {formatPrice(item.subtotal)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator className="border-foreground/20" />

                                {/* Total */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="size-4 text-muted-foreground" />
                                        <span className="font-mono text-sm font-bold">Total Pembayaran</span>
                                    </div>
                                    <span className="font-mono text-xl font-black text-primary">
                                        {formatPrice(order.total_price)}
                                    </span>
                                </div>

                                {order.payment_type && (
                                    <p className="font-mono text-xs text-muted-foreground">
                                        Metode: <span className="uppercase font-bold">{order.payment_type}</span>
                                    </p>
                                )}
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 border-t-2 border-foreground/20 pt-4">
                                {order.status === 'pending' && order.snap_redirect_url && (
                                    <a href={order.snap_redirect_url} className="w-full">
                                        <Button className="w-full font-mono font-bold shadow-[2px_2px_0_0_#000]" size="lg">
                                            <ExternalLink className="mr-2 size-4" />
                                            Lanjutkan Pembayaran
                                        </Button>
                                    </a>
                                )}
                                <Link href="/" className="w-full">
                                    <Button variant="outline" className="w-full font-mono text-sm border-2 border-foreground">
                                        <ArrowLeft className="mr-2 size-4" />
                                        Kembali ke Beranda
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
