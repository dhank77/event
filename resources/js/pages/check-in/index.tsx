import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    BadgeCheck,
    CalendarDays,
    Camera,
    CameraOff,
    CheckCircle2,
    Keyboard,
    Loader2,
    ScanLine,
    Upload,
    Users,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { index as checkInIndex, scan as checkInScan } from '@/routes/check-in';
import { dashboard } from '@/routes';
import type { PageProps } from '@/types';

/* ─── Types ─────────────────────────────────────────────────────── */

type EventOption = {
    id: number;
    title: string;
    slug: string;
    starts_at: string | null;
    total_paid: number;
    total_checked_in: number;
};

type OrderItem = {
    ticket_name: string;
    ticket_tier: string;
    quantity: number;
};

type ScannedOrder = {
    order_number: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    total_price: number;
    status: string;
    checked_in_at: string | null;
    event: { id: number; title: string };
    items_count: number;
    items: OrderItem[];
    vendor_name?: string;
};

type ScanStatus = 'idle' | 'scanning' | 'success' | 'already_checked_in' | 'wrong_event' | 'not_paid' | 'not_found' | 'forbidden' | 'error';

type CheckInIndexProps = {
    events: EventOption[];
    is_admin: boolean;
};

/* ─── Helpers ────────────────────────────────────────────────────── */

const formatIDR = (amount: number) =>
    amount === 0
        ? 'Gratis'
        : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const STATUS_UI: Record<ScanStatus, { bg: string; border: string; icon: typeof CheckCircle2; label: string } | null> = {
    idle: null,
    scanning: null,
    success: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-400', icon: CheckCircle2, label: 'Check-In Berhasil!' },
    already_checked_in: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-400', icon: AlertTriangle, label: 'Sudah Check-In Sebelumnya' },
    wrong_event: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-400', icon: AlertTriangle, label: 'Event Tidak Sesuai' },
    not_paid: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-400', icon: XCircle, label: 'Belum Lunas' },
    not_found: { bg: 'bg-slate-50 dark:bg-slate-950/30', border: 'border-slate-400', icon: AlertCircle, label: 'Order Tidak Ditemukan' },
    forbidden: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-400', icon: XCircle, label: 'Akses Ditolak' },
    error: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-400', icon: XCircle, label: 'Terjadi Kesalahan' },
};

/* ─── Page ───────────────────────────────────────────────────────── */

export default function CheckInIndex({ events, is_admin }: CheckInIndexProps) {
    const { props } = usePage<PageProps>();
    const csrfToken = (props as any).csrf_token as string | undefined;

    const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id ? String(events[0].id) : '');
    const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
    const [scanMessage, setScanMessage] = useState('');
    const [scannedOrder, setScannedOrder] = useState<ScannedOrder | null>(null);
    const [manualInput, setManualInput] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef<any>(null);
    const controlsRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastScannedRef = useRef<string>('');
    const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selectedEvent = events.find((e) => String(e.id) === selectedEventId);

    /* ── Scan submit ── */
    const submitScan = useCallback(
        async (orderNumber: string) => {
            const trimmed = orderNumber.trim().toUpperCase();
            if (!trimmed || isProcessing) return;
            if (trimmed === lastScannedRef.current) return; // debounce same code

            lastScannedRef.current = trimmed;
            setIsProcessing(true);
            setScanStatus('scanning');

            try {
                const res = await fetch(checkInScan().url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    },
                    body: JSON.stringify({
                        order_number: trimmed,
                        event_id: selectedEventId ? Number(selectedEventId) : null,
                    }),
                });

                const data = await res.json();
                setScanStatus(data.status as ScanStatus);
                setScanMessage(data.message ?? '');
                setScannedOrder(data.order ?? null);

                // Refresh event stats
                router.reload({ only: [] });

                // Reset cooldown so same code can be scanned again after 5s
                cooldownRef.current = setTimeout(() => {
                    lastScannedRef.current = '';
                }, 5000);
            } catch {
                setScanStatus('error');
                setScanMessage('Gagal terhubung ke server.');
                setScannedOrder(null);
            } finally {
                setIsProcessing(false);
            }
        },
        [isProcessing, selectedEventId],
    );

    /* ── Camera / QR Scanner ── */
    const startCamera = useCallback(async () => {
        setCameraError(null);

        // Check if mediaDevices is supported (requires HTTPS or localhost in modern browsers)
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            const isLocalhost =
                typeof window !== 'undefined' &&
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const msg = !isLocalhost && typeof window !== 'undefined' && window.location.protocol !== 'https:'
                ? 'Akses kamera di browser memerlukan koneksi HTTPS atau domain localhost. Untuk Laravel Herd/Valet, jalankan `herd secure` / `valet secure`, atau gunakan Input Manual / Upload QR.'
                : 'Browser Anda tidak mendukung akses kamera langsung (getUserMedia). Silakan gunakan Input Manual atau Upload QR.';
            setCameraError(msg);
            setIsCameraActive(false);
            return;
        }

        try {
            const { BrowserMultiFormatReader } = await import('@zxing/browser');
            const codeReader = new BrowserMultiFormatReader();
            codeReaderRef.current = codeReader;

            let deviceId: string | undefined = undefined;
            // Safely attempt device enumeration; do not throw if method is unsupported
            try {
                if (typeof navigator.mediaDevices.enumerateDevices === 'function') {
                    const devices = await BrowserMultiFormatReader.listVideoInputDevices();
                    deviceId = devices.find((d) => /back|rear|environment/i.test(d.label))?.deviceId ?? devices[0]?.deviceId;
                }
            } catch (enumErr) {
                console.warn('Could not enumerate video devices, continuing with default facingMode:', enumErr);
            }

            setIsCameraActive(true);

            // If deviceId is undefined, decodeFromVideoDevice automatically falls back to { facingMode: 'environment' }
            const controls = await codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (result) => {
                if (result) {
                    submitScan(result.getText());
                }
            });
            controlsRef.current = controls;
        } catch (err: any) {
            console.error('Camera start error:', err);
            setIsCameraActive(false);
            let msg = 'Gagal mengakses kamera.';
            if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
                msg = 'Izin kamera ditolak oleh browser. Silakan izinkan akses kamera di pengaturan browser.';
            } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
                msg = 'Perangkat kamera tidak ditemukan.';
            } else if (err?.message) {
                msg = err.message;
            }
            setCameraError(msg);
        }
    }, [submitScan]);

    const stopCamera = useCallback(() => {
        if (controlsRef.current) {
            try {
                controlsRef.current.stop();
            } catch {}
            controlsRef.current = null;
        }
        if (videoRef.current?.srcObject) {
            try {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
                videoRef.current.srcObject = null;
            } catch {}
        }
        setIsCameraActive(false);
    }, []);

    /* ── Image Upload QR decode fallback ── */
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsProcessing(true);
            const { BrowserMultiFormatReader } = await import('@zxing/browser');
            const codeReader = new BrowserMultiFormatReader();
            const objectUrl = URL.createObjectURL(file);

            try {
                const result = await codeReader.decodeFromImageUrl(objectUrl);
                if (result) {
                    submitScan(result.getText());
                }
            } catch {
                setScanStatus('error');
                setScanMessage('QR Code tidak terdeteksi pada gambar yang diunggah. Silakan coba gambar yang lebih jelas atau gunakan Input Manual.');
                setScannedOrder(null);
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        } catch (err) {
            console.error(err);
            setScanStatus('error');
            setScanMessage('Gagal memproses gambar QR.');
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    useEffect(() => {
        return () => {
            if (controlsRef.current) {
                try {
                    controlsRef.current.stop();
                } catch {}
            }
            if (cooldownRef.current) {
                clearTimeout(cooldownRef.current);
            }
        };
    }, []);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitScan(manualInput);
        setManualInput('');
    };

    const resultUI = STATUS_UI[scanStatus];

    return (
        <>
            <Head title="Check-In Absensi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <ScanLine className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Check-In Absensi</h1>
                        <p className="text-sm text-muted-foreground">
                            {is_admin ? 'Scan QR Code peserta dari semua event' : 'Scan QR Code peserta event Anda'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                    {/* Left — Scanner area */}
                    <div className="flex flex-col gap-4">

                        {/* Event selector + stats */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                            <CardContent className="pt-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex-1 min-w-[220px]">
                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Pilih Event
                                        </label>
                                        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                            <SelectTrigger id="checkin-event-select">
                                                <CalendarDays className="mr-2 size-4 text-muted-foreground" />
                                                <SelectValue placeholder="Pilih event..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {events.map((e) => (
                                                    <SelectItem key={e.id} value={String(e.id)}>
                                                        {e.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {selectedEvent && (
                                        <div className="flex gap-4">
                                            <StatPill
                                                icon={Users}
                                                label="Total Tiket"
                                                value={selectedEvent.total_paid}
                                                color="text-blue-500"
                                            />
                                            <StatPill
                                                icon={BadgeCheck}
                                                label="Hadir"
                                                value={selectedEvent.total_checked_in}
                                                color="text-green-500"
                                            />
                                            <StatPill
                                                icon={Users}
                                                label="Belum"
                                                value={selectedEvent.total_paid - selectedEvent.total_checked_in}
                                                color="text-amber-500"
                                            />
                                        </div>
                                    )}
                                </div>
                                {selectedEvent && (
                                    <div className="mt-3">
                                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-green-500 transition-all duration-500"
                                                style={{
                                                    width: selectedEvent.total_paid > 0
                                                        ? `${(selectedEvent.total_checked_in / selectedEvent.total_paid) * 100}%`
                                                        : '0%',
                                                }}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {selectedEvent.total_paid > 0
                                                ? `${Math.round((selectedEvent.total_checked_in / selectedEvent.total_paid) * 100)}% peserta hadir`
                                                : 'Belum ada peserta lunas'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* QR Camera */}
                        <Card className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Scanner QR Code</CardTitle>
                                    <div className="flex flex-wrap gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <Button
                                            id="checkin-upload-qr"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isProcessing}
                                        >
                                            <Upload className="size-4" />
                                            <span className="hidden sm:inline ml-1.5">Upload QR</span>
                                        </Button>
                                        <Button
                                            id="checkin-toggle-manual"
                                            variant={isManualMode ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setIsManualMode((v) => !v)}
                                        >
                                            <Keyboard className="size-4" />
                                            <span className="hidden sm:inline ml-1.5">Input Manual</span>
                                        </Button>
                                        {!isManualMode && (
                                            <Button
                                                id="checkin-toggle-camera"
                                                variant={isCameraActive ? 'destructive' : 'default'}
                                                size="sm"
                                                onClick={isCameraActive ? stopCamera : startCamera}
                                            >
                                                {isCameraActive ? <CameraOff className="size-4" /> : <Camera className="size-4" />}
                                                <span className="hidden sm:inline ml-1.5">{isCameraActive ? 'Stop' : 'Buka Kamera'}</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {isManualMode ? (
                                    <div className="p-4">
                                        <form onSubmit={handleManualSubmit} className="flex gap-2">
                                            <Input
                                                id="checkin-manual-input"
                                                placeholder="Ketik Order Number (e.g. ORD-XXXXXXXXXXXX)"
                                                value={manualInput}
                                                onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                                                className="font-mono"
                                                autoFocus
                                            />
                                            <Button id="checkin-manual-submit" type="submit" disabled={isProcessing || !manualInput.trim()}>
                                                {isProcessing ? <Loader2 className="size-4 animate-spin" /> : 'Scan'}
                                            </Button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="relative aspect-video w-full bg-black">
                                        <video
                                            ref={videoRef}
                                            className="h-full w-full object-cover"
                                            playsInline
                                            muted
                                        />
                                        {cameraError && !isCameraActive && (
                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-900/95 p-6 text-center text-white">
                                                <AlertTriangle className="size-10 text-amber-400 shrink-0" />
                                                <p className="max-w-md text-xs leading-relaxed text-zinc-300">{cameraError}</p>
                                                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => setIsManualMode(true)}
                                                    >
                                                        <Keyboard className="size-4 mr-1.5" />
                                                        Gunakan Input Manual
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="border-white/30 text-white hover:bg-white/10"
                                                    >
                                                        <Upload className="size-4 mr-1.5" />
                                                        Upload Gambar QR
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        {!isCameraActive && !cameraError && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60">
                                                <Camera className="size-12 opacity-40" />
                                                <p className="text-sm">Klik "Buka Kamera" untuk mulai scanning</p>
                                            </div>
                                        )}
                                        {isCameraActive && (
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                                <div className="relative size-52">
                                                    <span className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-white rounded-tl-sm" />
                                                    <span className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-white rounded-tr-sm" />
                                                    <span className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-white rounded-bl-sm" />
                                                    <span className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-white rounded-br-sm" />
                                                    {isProcessing && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Loader2 className="size-8 animate-spin text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right — Scan result */}
                    <div className="flex flex-col gap-4">
                        {scanStatus === 'idle' && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border flex-1">
                                <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                                    <ScanLine className="size-12 opacity-30" />
                                    <p className="text-sm">Hasil scan akan muncul di sini</p>
                                </CardContent>
                            </Card>
                        )}

                        {scanStatus === 'scanning' && (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border flex-1">
                                <CardContent className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                                    <Loader2 className="size-10 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Memproses...</p>
                                </CardContent>
                            </Card>
                        )}

                        {resultUI && scannedOrder !== null && (
                            <ResultCard
                                status={scanStatus}
                                message={scanMessage}
                                order={scannedOrder}
                                isAdmin={is_admin}
                                ui={resultUI}
                            />
                        )}

                        {resultUI && scannedOrder === null && (
                            <Card className={`border-2 ${resultUI.border} ${resultUI.bg}`}>
                                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                                    <resultUI.icon className="size-12" />
                                    <p className="font-semibold">{resultUI.label}</p>
                                    <p className="text-sm text-muted-foreground">{scanMessage}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Result Card ────────────────────────────────────────────────── */

function ResultCard({
    status,
    message,
    order,
    isAdmin,
    ui,
}: {
    status: ScanStatus;
    message: string;
    order: ScannedOrder;
    isAdmin: boolean;
    ui: NonNullable<(typeof STATUS_UI)[ScanStatus]>;
}) {
    const Icon = ui.icon;
    return (
        <Card className={`border-2 ${ui.border} ${ui.bg}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Icon className="size-5" />
                    <CardTitle className="text-base">{ui.label}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">{message}</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {status === 'wrong_event' && (
                    <div className="rounded-md border border-amber-300 bg-amber-100/70 p-2.5 text-xs font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
                        ⚠️ Tiket ini terdaftar untuk event <strong>"{order.event.title}"</strong>, bukan event yang sedang dipilih. Check-in tidak dapat diproses.
                    </div>
                )}
                <div className="rounded-lg border bg-background/60 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">#{order.order_number}</span>
                        <Badge variant={order.status === 'paid' ? 'default' : 'outline'} className="text-xs">
                            {order.status}
                        </Badge>
                    </div>
                    <Separator />
                    <InfoRow label="Nama" value={order.buyer_name} />
                    <InfoRow label="Email" value={order.buyer_email} />
                    <InfoRow label="Telepon" value={order.buyer_phone} />
                    <InfoRow label="Event" value={order.event.title} />
                    {isAdmin && order.vendor_name && <InfoRow label="Vendor" value={order.vendor_name} />}
                    <InfoRow label="Tiket" value={`${order.items_count} tiket`} />
                    {order.items.map((item, i) => (
                        <InfoRow
                            key={i}
                            label={`  ${item.ticket_name}`}
                            value={`${item.ticket_tier} × ${item.quantity}`}
                            small
                        />
                    ))}
                    <Separator />
                    <InfoRow label="Total" value={formatIDR(order.total_price)} bold />
                    {order.checked_in_at && (
                        <InfoRow
                            label="Check-in"
                            value={new Date(order.checked_in_at).toLocaleString('id-ID', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value, bold, small }: { label: string; value: string; bold?: boolean; small?: boolean }) {
    return (
        <div className={`flex items-start justify-between gap-2 ${small ? 'opacity-70' : ''}`}>
            <span className={`text-muted-foreground ${small ? 'text-xs' : 'text-sm'}`}>{label}</span>
            <span className={`text-right ${small ? 'text-xs' : 'text-sm'} ${bold ? 'font-bold' : 'font-medium'}`}>{value}</span>
        </div>
    );
}

/* ─── Stat Pill ──────────────────────────────────────────────────── */

function StatPill({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
    return (
        <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
            <Icon className={`size-4 ${color}`} />
            <span className="text-xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}


/* ─── Layout ─────────────────────────────────────────────────────── */

CheckInIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Check-In', href: checkInIndex() },
    ],
};
