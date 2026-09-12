import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownToLine,
    BadgeCheck,
    Building2,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock,
    CreditCard,
    FilterX,
    History,
    Plus,
    Send,
    User,
    Wallet,
    X,
    XCircle,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboard } from '@/routes';
import { index as vendorWithdrawalsIndex, store as storeWithdrawal, update as updateWithdrawal } from '@/routes/vendor/withdrawals';

/* ─── Types ────────────────────────────────────────────────────────── */

type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

type WithdrawalRow = {
    id: number;
    amount: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    status: WithdrawalStatus;
    notes: string | null;
    approved_at: string | null;
    rejected_at: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
};

type PaginatedWithdrawals = {
    data: WithdrawalRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Summary = {
    gross_revenue: number;
    platform_fee: number;
    net_earnings: number;
    total_approved: number;
    total_pending: number;
    available_balance: number;
};

type VendorOption = {
    id: number;
    name: string;
    email: string;
};

type Props = {
    withdrawals: PaginatedWithdrawals;
    summary: Summary;
    filters: {
        status?: string;
        vendor_id?: string;
    };
    is_admin: boolean;
    vendors: VendorOption[];
};

/* ─── Constants ────────────────────────────────────────────────────── */

const BANK_OPTIONS = [
    'BCA (Bank Central Asia)',
    'Bank Mandiri',
    'BNI (Bank Negara Indonesia)',
    'BRI (Bank Rakyat Indonesia)',
    'BSI (Bank Syariah Indonesia)',
    'CIMB Niaga',
    'Bank Permata',
    'Bank Jago',
    'SeaBank',
    'DANA',
    'GoPay',
    'OVO',
];

const STATUS_CONFIG: Record<
    WithdrawalStatus,
    { label: string; variant: 'secondary' | 'default' | 'destructive'; icon: typeof Clock }
> = {
    pending: { label: 'Menunggu', variant: 'secondary', icon: Clock },
    approved: { label: 'Disetujui', variant: 'default', icon: CheckCircle2 },
    rejected: { label: 'Ditolak', variant: 'destructive', icon: XCircle },
};

/* ─── Helpers ──────────────────────────────────────────────────────── */

const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/* ─── Page Component ───────────────────────────────────────────────── */

export default function VendorWithdrawalsIndex({
    withdrawals,
    summary,
    filters,
    is_admin,
    vendors,
}: Props) {
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRow | null>(null);
    const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
    const [adminNotes, setAdminNotes] = useState('');
    const [actionProcessing, setActionProcessing] = useState(false);

    // Form for new withdrawal
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        amount: '',
        bank_name: '',
        account_number: '',
        account_holder_name: '',
        notes: '',
    });

    const handleCreateWithdrawal = (e: FormEvent) => {
        e.preventDefault();
        post(storeWithdrawal().url, {
            onSuccess: () => {
                setRequestModalOpen(false);
                reset();
            },
        });
    };

    const handleActionSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedWithdrawal) return;

        setActionProcessing(true);
        router.patch(
            updateWithdrawal({ withdrawal: selectedWithdrawal.id }).url,
            {
                status: actionType,
                notes: adminNotes,
            },
            {
                onSuccess: () => {
                    setActionModalOpen(false);
                    setSelectedWithdrawal(null);
                    setAdminNotes('');
                },
                onFinish: () => setActionProcessing(false),
            },
        );
    };

    const setQuickAmount = (amount: number) => {
        const capped = Math.min(amount, summary.available_balance);
        setData('amount', capped.toString());
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value || undefined };
        router.get(vendorWithdrawalsIndex(), newFilters, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        router.get(vendorWithdrawalsIndex(), {}, { preserveScroll: true, replace: true });
    };

    const hasActiveFilters = !!filters.status || !!filters.vendor_id;

    return (
        <>
            <Head title="Penarikan Dana (Withdraw)" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-sm">
                                <Wallet className="size-5" />
                            </span>
                            <h1 className="font-mono text-2xl font-black tracking-tight sm:text-3xl">
                                PENARIKAN DANA
                            </h1>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {is_admin
                                ? 'Kelola dan setujui pencairan saldo pendapatan tiket seluruh vendor.'
                                : 'Kelola dan cairkan saldo bersih hasil penjualan tiket event Anda.'}
                        </p>
                    </div>

                    {!is_admin && (
                        <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="neo-lift border-2 border-foreground bg-primary font-mono text-sm font-bold text-primary-foreground shadow-md"
                                    disabled={summary.available_balance < 50000}
                                >
                                    <Plus className="size-4" />
                                    Tarik Saldo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="border-2 border-foreground bg-card sm:max-w-[540px] shadow-lg">
                                <form onSubmit={handleCreateWithdrawal}>
                                    <DialogHeader>
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-8 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground">
                                                <ArrowDownToLine className="size-4" />
                                            </div>
                                            <DialogTitle className="font-mono text-lg font-black">
                                                AJUKAN PENARIKAN DANA
                                            </DialogTitle>
                                        </div>
                                        <DialogDescription className="text-xs">
                                            Saldo akan ditransfer ke rekening bank atau akun e-wallet terdaftar Anda.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-4 py-4">
                                        {/* Available Balance Reminder */}
                                        <div className="flex items-center justify-between border-2 border-foreground bg-muted p-3">
                                            <span className="font-mono text-xs font-bold uppercase text-muted-foreground">
                                                Saldo Tersedia:
                                            </span>
                                            <span className="font-mono text-lg font-black text-primary">
                                                {formatIDR(summary.available_balance)}
                                            </span>
                                        </div>

                                        {/* Amount */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount" className="font-mono text-xs font-bold uppercase">
                                                Nominal Penarikan (Rp) *
                                            </Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="Contoh: 100000"
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                className="border-2 border-foreground font-mono text-base font-bold"
                                                min={50000}
                                                max={summary.available_balance}
                                                required
                                            />
                                            {errors.amount && (
                                                <p className="font-mono text-xs font-bold text-destructive">
                                                    {errors.amount}
                                                </p>
                                            )}

                                            {/* Quick Amount Chips */}
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {[100000, 500000, 1000000, summary.available_balance].map((val, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setQuickAmount(val)}
                                                        className="border-2 border-foreground bg-background px-2.5 py-1 font-mono text-[11px] font-bold transition-transform hover:-translate-y-0.5"
                                                    >
                                                        {val === summary.available_balance ? 'Semua Saldo' : formatIDR(val)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bank Name */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="bank_name" className="font-mono text-xs font-bold uppercase">
                                                Bank atau E-Wallet *
                                            </Label>
                                            <Select
                                                value={data.bank_name}
                                                onValueChange={(val) => setData('bank_name', val)}
                                            >
                                                <SelectTrigger className="border-2 border-foreground font-mono text-sm">
                                                    <SelectValue placeholder="Pilih Bank / E-Wallet" />
                                                </SelectTrigger>
                                                <SelectContent className="border-2 border-foreground">
                                                    {BANK_OPTIONS.map((bank) => (
                                                        <SelectItem key={bank} value={bank} className="font-mono text-sm">
                                                            {bank}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.bank_name && (
                                                <p className="font-mono text-xs font-bold text-destructive">
                                                    {errors.bank_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Account Number */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="account_number" className="font-mono text-xs font-bold uppercase">
                                                Nomor Rekening / No. HP E-Wallet *
                                            </Label>
                                            <Input
                                                id="account_number"
                                                type="text"
                                                placeholder="Contoh: 1234567890"
                                                value={data.account_number}
                                                onChange={(e) => setData('account_number', e.target.value)}
                                                className="border-2 border-foreground font-mono text-sm"
                                                required
                                            />
                                            {errors.account_number && (
                                                <p className="font-mono text-xs font-bold text-destructive">
                                                    {errors.account_number}
                                                </p>
                                            )}
                                        </div>

                                        {/* Account Holder Name */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="account_holder_name" className="font-mono text-xs font-bold uppercase">
                                                Nama Pemilik Rekening *
                                            </Label>
                                            <Input
                                                id="account_holder_name"
                                                type="text"
                                                placeholder="Sesuai buku tabungan / akun e-wallet"
                                                value={data.account_holder_name}
                                                onChange={(e) => setData('account_holder_name', e.target.value)}
                                                className="border-2 border-foreground font-mono text-sm"
                                                required
                                            />
                                            {errors.account_holder_name && (
                                                <p className="font-mono text-xs font-bold text-destructive">
                                                    {errors.account_holder_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Optional Notes */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes" className="font-mono text-xs font-bold uppercase">
                                                Catatan (Opsional)
                                            </Label>
                                            <Input
                                                id="notes"
                                                type="text"
                                                placeholder="Catatan tambahan untuk admin"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                className="border-2 border-foreground text-sm"
                                            />
                                        </div>

                                        <div className="flex items-start gap-2 border-2 border-foreground bg-secondary/40 p-3 text-xs text-secondary-foreground">
                                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Minimal penarikan adalah <strong>Rp 50.000</strong>. Pencairan akan diproses oleh tim kami dalam 1-2 hari kerja.
                                            </span>
                                        </div>
                                    </div>

                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setRequestModalOpen(false)}
                                            className="border-2 border-foreground font-mono"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="border-2 border-foreground bg-primary font-mono font-bold text-primary-foreground shadow-sm"
                                        >
                                            {processing ? 'Memproses...' : 'Kirim Pengajuan'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* ═══ FINANCIAL SUMMARY CARDS (Neobrutalism) ═══ */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Available Balance (Highlighted Card) */}
                    <Card className="neo-lift border-2 border-foreground bg-secondary shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="font-mono text-xs font-black uppercase tracking-wider text-secondary-foreground">
                                Saldo Tersedia
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center border-2 border-foreground bg-background shadow-xs">
                                <Wallet className="size-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-2xl font-black text-foreground sm:text-3xl">
                                {formatIDR(summary.available_balance)}
                            </div>
                            <p className="mt-1 text-xs text-secondary-foreground/80">
                                Siap untuk dicairkan kapan saja
                            </p>
                        </CardContent>
                    </Card>

                    {/* Net Earnings */}
                    <Card className="neo-lift border-2 border-foreground bg-card shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Pendapatan Bersih (97%)
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shadow-xs">
                                <CircleDollarSign className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-2xl font-bold">
                                {formatIDR(summary.net_earnings)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Dari total penjualan {formatIDR(summary.gross_revenue)}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Approved */}
                    <Card className="neo-lift border-2 border-foreground bg-card shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Berhasil Ditarik
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground shadow-xs">
                                <CheckCircle2 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-2xl font-bold">
                                {formatIDR(summary.total_approved)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Dana telah masuk ke rekening
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Pending */}
                    <Card className="neo-lift border-2 border-foreground bg-card shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Sedang Diproses
                            </CardTitle>
                            <div className="flex size-8 items-center justify-center border-2 border-foreground bg-muted text-foreground shadow-xs">
                                <Clock className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="font-mono text-2xl font-bold">
                                {formatIDR(summary.total_pending)}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Menunggu verifikasi admin
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ═══ FILTERS SECTION ═══ */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-foreground bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filter Status */}
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold uppercase">Status:</span>
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(val) => handleFilterChange('status', val === 'all' ? '' : val)}
                            >
                                <SelectTrigger className="h-9 w-36 border-2 border-foreground font-mono text-xs">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-foreground">
                                    <SelectItem value="all" className="font-mono text-xs">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="pending" className="font-mono text-xs">
                                        Menunggu
                                    </SelectItem>
                                    <SelectItem value="approved" className="font-mono text-xs">
                                        Disetujui
                                    </SelectItem>
                                    <SelectItem value="rejected" className="font-mono text-xs">
                                        Ditolak
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter Vendor (Admin only) */}
                        {is_admin && vendors.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold uppercase">Vendor:</span>
                                <Select
                                    value={filters.vendor_id ?? 'all'}
                                    onValueChange={(val) => handleFilterChange('vendor_id', val === 'all' ? '' : val)}
                                >
                                    <SelectTrigger className="h-9 w-48 border-2 border-foreground font-mono text-xs">
                                        <SelectValue placeholder="Semua Vendor" />
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-foreground">
                                        <SelectItem value="all" className="font-mono text-xs">
                                            Semua Vendor
                                        </SelectItem>
                                        {vendors.map((v) => (
                                            <SelectItem key={v.id} value={v.id.toString()} className="font-mono text-xs">
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="font-mono text-xs font-bold text-muted-foreground"
                        >
                            <FilterX className="size-3.5" />
                            Hapus Filter
                        </Button>
                    )}
                </div>

                {/* ═══ WITHDRAWALS TABLE (Neobrutalism) ═══ */}
                <Card className="border-2 border-foreground shadow-md">
                    <CardHeader className="border-b-2 border-foreground bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="size-4" />
                                <CardTitle className="font-mono text-base font-black uppercase">
                                    Riwayat Penarikan Dana
                                </CardTitle>
                            </div>
                            <Badge variant="outline" className="border-2 border-foreground font-mono text-xs">
                                Total {withdrawals.total} Transaksi
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {withdrawals.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="flex size-14 items-center justify-center border-2 border-foreground bg-muted shadow-sm">
                                    <Wallet className="size-7 opacity-40" />
                                </div>
                                <h3 className="mt-4 font-mono text-lg font-bold">Belum Ada Riwayat Penarikan</h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    {is_admin
                                        ? 'Belum ada pengajuan penarikan dana dari vendor yang sesuai dengan filter.'
                                        : 'Anda belum pernah mengajukan penarikan dana. Klik tombol "Tarik Saldo" untuk mencairkan pendapatan tiket Anda.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/40 font-mono text-xs uppercase">
                                        <TableRow className="border-b-2 border-foreground">
                                            <TableHead className="font-bold text-foreground">Waktu</TableHead>
                                            {is_admin && <TableHead className="font-bold text-foreground">Vendor</TableHead>}
                                            <TableHead className="font-bold text-foreground">Tujuan Transfer</TableHead>
                                            <TableHead className="font-bold text-foreground">Nominal</TableHead>
                                            <TableHead className="font-bold text-foreground">Status</TableHead>
                                            <TableHead className="font-bold text-foreground">Catatan</TableHead>
                                            {is_admin && <TableHead className="text-right font-bold text-foreground">Aksi</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {withdrawals.data.map((item) => {
                                            const status = STATUS_CONFIG[item.status];
                                            const StatusIcon = status.icon;

                                            return (
                                                <TableRow
                                                    key={item.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/30"
                                                >
                                                    {/* Date */}
                                                    <TableCell className="font-mono text-xs">
                                                        <div className="font-bold">{item.created_at}</div>
                                                        <div className="text-[11px] text-muted-foreground">ID #{item.id}</div>
                                                    </TableCell>

                                                    {/* Vendor (Admin only) */}
                                                    {is_admin && (
                                                        <TableCell>
                                                            <div className="font-bold text-sm">{item.user.name}</div>
                                                            <div className="font-mono text-xs text-muted-foreground">{item.user.email}</div>
                                                        </TableCell>
                                                    )}

                                                    {/* Bank Info */}
                                                    <TableCell>
                                                        <div className="font-mono text-xs font-bold">{item.bank_name}</div>
                                                        <div className="font-mono text-xs">{item.account_number}</div>
                                                        <div className="text-xs text-muted-foreground">a.n. {item.account_holder_name}</div>
                                                    </TableCell>

                                                    {/* Amount */}
                                                    <TableCell>
                                                        <span className="font-mono text-sm font-black text-primary">
                                                            {formatIDR(item.amount)}
                                                        </span>
                                                    </TableCell>

                                                    {/* Status Badge */}
                                                    <TableCell>
                                                        <Badge
                                                            variant={status.variant}
                                                            className="border-2 border-foreground font-mono text-[11px] font-bold uppercase shadow-2xs"
                                                        >
                                                            <StatusIcon className="size-3" />
                                                            {status.label}
                                                        </Badge>
                                                        {item.approved_at && (
                                                            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                                                                ✓ {item.approved_at}
                                                            </div>
                                                        )}
                                                        {item.rejected_at && (
                                                            <div className="mt-1 font-mono text-[10px] text-destructive">
                                                                ✕ {item.rejected_at}
                                                            </div>
                                                        )}
                                                    </TableCell>

                                                    {/* Notes */}
                                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                        {item.notes || '—'}
                                                    </TableCell>

                                                    {/* Admin Actions */}
                                                    {is_admin && (
                                                        <TableCell className="text-right">
                                                            {item.status === 'pending' ? (
                                                                <div className="flex justify-end gap-1.5">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedWithdrawal(item);
                                                                            setActionType('approved');
                                                                            setAdminNotes('');
                                                                            setActionModalOpen(true);
                                                                        }}
                                                                        className="border-2 border-foreground bg-primary font-mono text-xs font-bold text-primary-foreground shadow-xs"
                                                                    >
                                                                        <Check className="size-3.5" />
                                                                        Setujui
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => {
                                                                            setSelectedWithdrawal(item);
                                                                            setActionType('rejected');
                                                                            setAdminNotes('');
                                                                            setActionModalOpen(true);
                                                                        }}
                                                                        className="border-2 border-foreground font-mono text-xs font-bold shadow-xs"
                                                                    >
                                                                        <X className="size-3.5" />
                                                                        Tolak
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className="font-mono text-xs text-muted-foreground">
                                                                    Selesai
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ═══ PAGINATION ═══ */}
                {withdrawals.last_page > 1 && (
                    <div className="flex items-center justify-between border-2 border-foreground bg-card p-3 shadow-sm">
                        <div className="font-mono text-xs text-muted-foreground">
                            Menampilkan <strong>{withdrawals.from}</strong>-<strong>{withdrawals.to}</strong> dari{' '}
                            <strong>{withdrawals.total}</strong> penarikan
                        </div>
                        <div className="flex items-center gap-1">
                            {withdrawals.links.map((link, i) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="icon"
                                            className="size-8 border-2 border-foreground"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                        >
                                            <ChevronLeft className="size-4" />
                                        </Button>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="icon"
                                            className="size-8 border-2 border-foreground"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                        >
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    );
                                }
                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="icon"
                                        className="size-8 border-2 border-foreground font-mono text-xs font-bold"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                    >
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ═══ ADMIN ACTION CONFIRMATION MODAL ═══ */}
                {is_admin && selectedWithdrawal && (
                    <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
                        <DialogContent className="border-2 border-foreground bg-card shadow-lg sm:max-w-[450px]">
                            <form onSubmit={handleActionSubmit}>
                                <DialogHeader>
                                    <DialogTitle className="font-mono text-lg font-black uppercase">
                                        {actionType === 'approved' ? 'Setujui Penarikan Dana' : 'Tolak Penarikan Dana'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs">
                                        ID #{selectedWithdrawal.id} — {selectedWithdrawal.user.name} ({formatIDR(selectedWithdrawal.amount)})
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-3 py-4 text-sm">
                                    <div className="border-2 border-foreground bg-muted p-3">
                                        <div className="font-mono text-xs font-bold text-muted-foreground uppercase">Tujuan:</div>
                                        <div className="font-mono font-bold">{selectedWithdrawal.bank_name} - {selectedWithdrawal.account_number}</div>
                                        <div className="text-xs">a.n. {selectedWithdrawal.account_holder_name}</div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="admin_notes" className="font-mono text-xs font-bold uppercase">
                                            Catatan / Nomor Referensi Transfer
                                        </Label>
                                        <textarea
                                            id="admin_notes"
                                            placeholder={actionType === 'approved' ? 'Contoh: No. Ref BCA 829104829' : 'Alasan penolakan (e.g. rekening tidak valid)'}
                                            value={adminNotes}
                                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                                            className="w-full border-2 border-foreground bg-background p-2 font-mono text-xs focus:outline-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setActionModalOpen(false)}
                                        className="border-2 border-foreground font-mono"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={actionProcessing}
                                        variant={actionType === 'approved' ? 'default' : 'destructive'}
                                        className="border-2 border-foreground font-mono font-bold shadow-xs"
                                    >
                                        {actionProcessing
                                            ? 'Memproses...'
                                            : actionType === 'approved'
                                            ? 'Konfirmasi Setuju'
                                            : 'Konfirmasi Tolak'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
}

VendorWithdrawalsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Tarik Saldo', href: vendorWithdrawalsIndex() },
    ],
};
