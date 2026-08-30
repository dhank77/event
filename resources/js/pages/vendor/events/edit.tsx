import { Head, Link, router } from '@inertiajs/react';
import {
    Percent,
    Plus,
    Tag,
    Ticket,
    TicketX,
    Trash2,
    Pencil,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EventForm } from '@/components/event-form';
import type { EventFormData } from '@/components/event-form';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { update as updateEvent } from '@/actions/App/Http/Controllers/Vendor/EventController';
import {
    store as storeTicket,
    update as updateTicket,
    destroy as destroyTicket,
} from '@/actions/App/Http/Controllers/Vendor/EventTicketController';
import {
    store as storeCoupon,
    update as updateCoupon,
    destroy as destroyCoupon,
} from '@/actions/App/Http/Controllers/Vendor/EventCouponController';
import { index as eventsIndex, edit as eventsEdit } from '@/routes/vendor/events';
import { dashboard } from '@/routes';

type TicketTier = 'regular' | 'early_bird' | 'vip' | 'group';

const TICKET_TIERS: { value: TicketTier; label: string }[] = [
    { value: 'regular', label: 'Regular' },
    { value: 'early_bird', label: 'Early Bird' },
    { value: 'vip', label: 'VIP' },
    { value: 'group', label: 'Group Package' },
];

const TIER_COLORS: Record<TicketTier, string> = {
    regular: 'bg-secondary text-secondary-foreground',
    early_bird: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    vip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    group: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

type TicketType = {
    id: number;
    name: string;
    type: 'free' | 'paid';
    tier: TicketTier;
    price: number;
    quota: number | null;
    max_per_order: number;
    sales_start: string | null;
    sales_end: string | null;
    description: string | null;
    is_active: boolean;
};

type CouponType = {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    max_uses: number | null;
    used_count: number;
    min_purchase: number;
    valid_from: string | null;
    valid_until: string | null;
    is_active: boolean;
};

type EventData = Partial<EventFormData> & {
    id: number;
    tickets: TicketType[];
    coupons: CouponType[];
};

type Tab = 'info' | 'tickets' | 'coupons';

const formatIDR = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// Default empty ticket form state
const emptyTicket = () => ({
    name: '',
    type: 'free' as 'free' | 'paid',
    tier: 'regular' as TicketTier,
    price: '',
    quota: '',
    max_per_order: '1',
    sales_start: '',
    sales_end: '',
    description: '',
    is_active: true,
});

// Default empty coupon form state
const emptyCoupon = () => ({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    max_uses: '',
    min_purchase: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
});

export default function EditEvent({ event }: { event: EventData }) {
    const [activeTab, setActiveTab] = useState<Tab>('info');

    // --- Ticket state ---
    const [ticketDialog, setTicketDialog] = useState(false);
    const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
    const [ticketForm, setTicketForm] = useState(emptyTicket());
    const [ticketErrors, setTicketErrors] = useState<Record<string, string>>({});
    const [ticketSaving, setTicketSaving] = useState(false);
    const [deleteTicketTarget, setDeleteTicketTarget] = useState<TicketType | null>(null);

    // --- Coupon state ---
    const [couponDialog, setCouponDialog] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<CouponType | null>(null);
    const [couponForm, setCouponForm] = useState(emptyCoupon());
    const [couponErrors, setCouponErrors] = useState<Record<string, string>>({});
    const [couponSaving, setCouponSaving] = useState(false);
    const [deleteCouponTarget, setDeleteCouponTarget] = useState<CouponType | null>(null);

    // --- Ticket helpers ---
    function openTicketCreate() {
        setEditingTicket(null);
        setTicketForm(emptyTicket());
        setTicketErrors({});
        setTicketDialog(true);
    }

    function openTicketEdit(ticket: TicketType) {
        setEditingTicket(ticket);
        setTicketForm({
            name: ticket.name,
            type: ticket.type,
            tier: ticket.tier,
            price: ticket.price.toString(),
            quota: ticket.quota?.toString() ?? '',
            max_per_order: ticket.max_per_order.toString(),
            sales_start: ticket.sales_start ?? '',
            sales_end: ticket.sales_end ?? '',
            description: ticket.description ?? '',
            is_active: ticket.is_active,
        });
        setTicketErrors({});
        setTicketDialog(true);
    }

    function saveTicket() {
        setTicketSaving(true);
        const url = editingTicket
            ? updateTicket.url({ event: event.id, ticket: editingTicket.id })
            : storeTicket.url({ event: event.id });

        const method = editingTicket ? 'put' : 'post';

        router[method](url, ticketForm, {
            preserveScroll: true,
            onError: (errs) => setTicketErrors(errs),
            onSuccess: () => setTicketDialog(false),
            onFinish: () => setTicketSaving(false),
        });
    }

    function deleteTicket() {
        if (!deleteTicketTarget) return;
        router.delete(destroyTicket.url({ event: event.id, ticket: deleteTicketTarget.id }), {
            preserveScroll: true,
            onSuccess: () => setDeleteTicketTarget(null),
        });
    }

    // --- Coupon helpers ---
    function openCouponCreate() {
        setEditingCoupon(null);
        setCouponForm(emptyCoupon());
        setCouponErrors({});
        setCouponDialog(true);
    }

    function openCouponEdit(coupon: CouponType) {
        setEditingCoupon(coupon);
        setCouponForm({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value.toString(),
            max_uses: coupon.max_uses?.toString() ?? '',
            min_purchase: coupon.min_purchase?.toString() ?? '',
            valid_from: coupon.valid_from ?? '',
            valid_until: coupon.valid_until ?? '',
            is_active: coupon.is_active,
        });
        setCouponErrors({});
        setCouponDialog(true);
    }

    function saveCoupon() {
        setCouponSaving(true);
        const url = editingCoupon
            ? updateCoupon.url({ event: event.id, coupon: editingCoupon.id })
            : storeCoupon.url({ event: event.id });

        const method = editingCoupon ? 'put' : 'post';

        router[method](url, couponForm, {
            preserveScroll: true,
            onError: (errs) => setCouponErrors(errs),
            onSuccess: () => setCouponDialog(false),
            onFinish: () => setCouponSaving(false),
        });
    }

    function deleteCoupon() {
        if (!deleteCouponTarget) return;
        router.delete(destroyCoupon.url({ event: event.id, coupon: deleteCouponTarget.id }), {
            preserveScroll: true,
            onSuccess: () => setDeleteCouponTarget(null),
        });
    }

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: 'info', label: 'Info Event' },
        { id: 'tickets', label: 'Tiket', count: event.tickets?.length },
        { id: 'coupons', label: 'Kupon', count: event.coupons?.length },
    ];

    return (
        <>
            <Head title={`Edit: ${event.title}`} />
            <h1 className="sr-only">Edit Event: {event.title}</h1>

            <div className="px-4 py-6 max-w-3xl space-y-6">
                <Heading
                    title={`Edit Event`}
                    description={event.title as string}
                />

                {/* Tabs */}
                <div className="flex gap-1 border-b">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab: Info Event */}
                {activeTab === 'info' && (
                    <EventForm
                        defaultValues={event}
                        action={updateEvent.url({ event: event.id })}
                        method="put"
                        submitLabel="Simpan Perubahan"
                    />
                )}

                {/* Tab: Tiket */}
                {activeTab === 'tickets' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Kelola tiket dan harga untuk event ini.
                            </p>
                            <Button size="sm" onClick={openTicketCreate}>
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Tambah Tiket
                            </Button>
                        </div>

                        {event.tickets?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
                                <TicketX className="h-10 w-10 text-muted-foreground mb-3" />
                                <p className="font-medium">Belum ada tiket</p>
                                <p className="text-sm text-muted-foreground mt-1">Tambahkan tiket gratis atau berbayar untuk event ini.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {event.tickets?.map((ticket) => (
                                    <div key={ticket.id} className="flex items-start gap-4 rounded-xl border p-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium">{ticket.name}</p>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TIER_COLORS[ticket.tier]}`}>
                                                    {TICKET_TIERS.find((t) => t.value === ticket.tier)?.label}
                                                </span>
                                                {!ticket.is_active && (
                                                    <Badge variant="outline" className="text-xs">Nonaktif</Badge>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                <span className="font-semibold text-foreground">
                                                    {ticket.type === 'free' ? 'Gratis' : formatIDR(ticket.price)}
                                                </span>
                                                {ticket.quota && <span>Kuota: {ticket.quota}</span>}
                                                {ticket.sales_start && (
                                                    <span>
                                                        {formatDate(ticket.sales_start)} — {formatDate(ticket.sales_end)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openTicketEdit(ticket)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTicketTarget(ticket)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Kupon */}
                {activeTab === 'coupons' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Buat kode promo dan diskon khusus untuk event ini.
                            </p>
                            <Button size="sm" onClick={openCouponCreate}>
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Buat Kupon
                            </Button>
                        </div>

                        {event.coupons?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
                                <Tag className="h-10 w-10 text-muted-foreground mb-3" />
                                <p className="font-medium">Belum ada kupon</p>
                                <p className="text-sm text-muted-foreground mt-1">Buat kupon diskon persentase atau potongan harga tetap.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {event.coupons?.map((coupon) => (
                                    <div key={coupon.id} className="flex items-start gap-4 rounded-xl border p-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono font-bold">
                                                    {coupon.code}
                                                </code>
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${coupon.type === 'percentage' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                                                    {coupon.type === 'percentage'
                                                        ? `${coupon.value}%`
                                                        : `${formatIDR(coupon.value)} off`}
                                                </span>
                                                {!coupon.is_active && (
                                                    <Badge variant="outline" className="text-xs">Nonaktif</Badge>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                {coupon.max_uses && (
                                                    <span>{coupon.used_count}/{coupon.max_uses} digunakan</span>
                                                )}
                                                {coupon.min_purchase > 0 && (
                                                    <span>Min. pembelian: {formatIDR(coupon.min_purchase)}</span>
                                                )}
                                                {coupon.valid_from && (
                                                    <span>
                                                        {formatDate(coupon.valid_from)} — {formatDate(coupon.valid_until)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCouponEdit(coupon)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteCouponTarget(coupon)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Ticket Dialog */}
            <Dialog open={ticketDialog} onOpenChange={setTicketDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingTicket ? 'Edit Tiket' : 'Tambah Tiket Baru'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Nama Tiket <span className="text-destructive">*</span></Label>
                            <Input
                                value={ticketForm.name}
                                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                                placeholder="Contoh: Tiket VIP Early Bird"
                            />
                            <InputError message={ticketErrors.name} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label>Tipe</Label>
                                <Select value={ticketForm.type} onValueChange={(v) => setTicketForm({ ...ticketForm, type: v as 'free' | 'paid', price: v === 'free' ? '0' : ticketForm.price })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">Gratis</SelectItem>
                                        <SelectItem value="paid">Berbayar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Tier</Label>
                                <Select value={ticketForm.tier} onValueChange={(v) => setTicketForm({ ...ticketForm, tier: v as TicketTier })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {TICKET_TIERS.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {ticketForm.type === 'paid' && (
                            <div className="grid gap-2">
                                <Label>Harga (IDR) <span className="text-destructive">*</span></Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={ticketForm.price}
                                    onChange={(e) => setTicketForm({ ...ticketForm, price: e.target.value })}
                                    placeholder="150000"
                                />
                                <InputError message={ticketErrors.price} />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label>Kuota</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={ticketForm.quota}
                                    onChange={(e) => setTicketForm({ ...ticketForm, quota: e.target.value })}
                                    placeholder="Tak terbatas"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Maks. per Pesanan</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={ticketForm.max_per_order}
                                    onChange={(e) => setTicketForm({ ...ticketForm, max_per_order: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label>Penjualan Mulai</Label>
                                <Input
                                    type="datetime-local"
                                    value={ticketForm.sales_start}
                                    onChange={(e) => setTicketForm({ ...ticketForm, sales_start: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Penjualan Berakhir</Label>
                                <Input
                                    type="datetime-local"
                                    value={ticketForm.sales_end}
                                    onChange={(e) => setTicketForm({ ...ticketForm, sales_end: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="ticket_is_active"
                                checked={ticketForm.is_active}
                                onCheckedChange={(v) => setTicketForm({ ...ticketForm, is_active: !!v })}
                            />
                            <Label htmlFor="ticket_is_active" className="font-normal cursor-pointer">Tiket aktif dan dapat dibeli</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTicketDialog(false)}>Batal</Button>
                        <Button onClick={saveTicket} disabled={ticketSaving}>
                            {ticketSaving ? 'Menyimpan...' : (editingTicket ? 'Simpan' : 'Tambah Tiket')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Ticket Dialog */}
            <Dialog open={!!deleteTicketTarget} onOpenChange={() => setDeleteTicketTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Tiket?</DialogTitle>
                        <DialogDescription>
                            Tiket <strong>"{deleteTicketTarget?.name}"</strong> akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTicketTarget(null)}>Batal</Button>
                        <Button variant="destructive" onClick={deleteTicket}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Coupon Dialog */}
            <Dialog open={couponDialog} onOpenChange={setCouponDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingCoupon ? 'Edit Kupon' : 'Buat Kupon Baru'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label>Kode Kupon <span className="text-destructive">*</span></Label>
                                <Input
                                    value={couponForm.code}
                                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                    placeholder="DISKON50"
                                    maxLength={50}
                                    className="font-mono"
                                />
                                <InputError message={couponErrors.code} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipe Diskon</Label>
                                <Select value={couponForm.type} onValueChange={(v) => setCouponForm({ ...couponForm, type: v as 'percentage' | 'fixed' })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">
                                            <div className="flex items-center gap-2">
                                                <Percent className="h-3.5 w-3.5" /> Persentase (%)
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-3.5 w-3.5" /> Potongan Harga (Rp)
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label>
                                    Nilai {couponForm.type === 'percentage' ? '(%)' : '(IDR)'} <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={couponForm.type === 'percentage' ? 100 : undefined}
                                    value={couponForm.value}
                                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                                    placeholder={couponForm.type === 'percentage' ? '50' : '50000'}
                                />
                                <InputError message={couponErrors.value} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Maks. Penggunaan</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={couponForm.max_uses}
                                    onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                                    placeholder="Tak terbatas"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Min. Pembelian (IDR)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={couponForm.min_purchase}
                                onChange={(e) => setCouponForm({ ...couponForm, min_purchase: e.target.value })}
                                placeholder="0 (tidak ada minimum)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label>Berlaku Dari</Label>
                                <Input
                                    type="datetime-local"
                                    value={couponForm.valid_from}
                                    onChange={(e) => setCouponForm({ ...couponForm, valid_from: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Berlaku Hingga</Label>
                                <Input
                                    type="datetime-local"
                                    value={couponForm.valid_until}
                                    onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="coupon_is_active"
                                checked={couponForm.is_active}
                                onCheckedChange={(v) => setCouponForm({ ...couponForm, is_active: !!v })}
                            />
                            <Label htmlFor="coupon_is_active" className="font-normal cursor-pointer">Kupon aktif dan dapat digunakan</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCouponDialog(false)}>Batal</Button>
                        <Button onClick={saveCoupon} disabled={couponSaving}>
                            {couponSaving ? 'Menyimpan...' : (editingCoupon ? 'Simpan' : 'Buat Kupon')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Coupon Dialog */}
            <Dialog open={!!deleteCouponTarget} onOpenChange={() => setDeleteCouponTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Kupon?</DialogTitle>
                        <DialogDescription>
                            Kupon <strong>"{deleteCouponTarget?.code}"</strong> akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteCouponTarget(null)}>Batal</Button>
                        <Button variant="destructive" onClick={deleteCoupon}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EditEvent.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Kelola Event', href: eventsIndex() },
        { title: 'Edit Event' },
    ],
};
