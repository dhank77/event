import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock,
    FilterX,
    Search,
    ShoppingCart,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { index as ordersIndex } from '@/routes/orders';
import { dashboard } from '@/routes';

/* ─── Types ────────────────────────────────────────────────────── */

type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

type OrderRow = {
    id: number;
    order_number: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    total_price: number;
    status: OrderStatus;
    payment_type: string | null;
    created_at: string;
    event: { id: number; title: string };
    items_count: number;
    fee?: number;
    vendor_name?: string;
};

type PaginatedOrders = {
    data: OrderRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type EventOption = { id: number; title: string };

type Summary = {
    total_orders: number;
    paid_orders: number;
    total_revenue: number;
    total_fee?: number;
};

type Filters = {
    event_id?: string;
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
};

type OrdersIndexProps = {
    orders: PaginatedOrders;
    events: EventOption[];
    filters: Filters;
    summary: Summary;
    is_admin: boolean;
};

/* ─── Helpers ───────────────────────────────────────────────────── */

const formatIDR = (amount: number) => {
    if (amount === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
    paid: { label: 'Lunas', variant: 'default', icon: BadgeCheck },
    pending: { label: 'Pending', variant: 'secondary', icon: Clock },
    cancelled: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle },
    expired: { label: 'Kedaluwarsa', variant: 'outline', icon: XCircle },
};

/* ─── Sub-components ────────────────────────────────────────────── */

function SummaryCard({
    icon: Icon,
    label,
    value,
    iconClassName = '',
    highlight = false,
}: {
    icon: typeof ShoppingCart;
    label: string;
    value: string;
    iconClassName?: string;
    highlight?: boolean;
}) {
    return (
        <Card className={`border-sidebar-border/70 dark:border-sidebar-border ${highlight ? 'ring-2 ring-amber-400/60' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`size-4 ${iconClassName}`} />
            </CardHeader>
            <CardContent>
                <div className="truncate text-xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

/* ─── Page ──────────────────────────────────────────────────────── */

export default function OrdersIndex({ orders, events, filters, summary, is_admin }: OrdersIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const applyFilters = useCallback(
        (overrides: Partial<Filters> = {}) => {
            router.get(
                ordersIndex(),
                {
                    ...filters,
                    search: search || undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    ...overrides,
                },
                { preserveScroll: true, preserveState: true, replace: true },
            );
        },
        [filters, search, dateFrom, dateTo],
    );

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') applyFilters();
    };

    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        router.get(ordersIndex(), {}, { preserveScroll: true, replace: true });
    };

    const hasActiveFilters =
        !!filters.search || !!filters.event_id || !!filters.status || !!filters.date_from || !!filters.date_to;

    return (
        <>
            <Head title="Orders" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                        <p className="text-sm text-muted-foreground">
                            {is_admin ? 'Semua transaksi dari seluruh vendor' : 'Transaksi dari event Anda'}
                        </p>
                    </div>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
                            <FilterX className="size-4" />
                            Hapus filter
                        </Button>
                    )}
                </div>

                {/* Summary Cards */}
                <div className={`grid gap-4 ${is_admin ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
                    <SummaryCard
                        icon={ShoppingCart}
                        label="Total Order"
                        value={summary.total_orders.toLocaleString('id-ID')}
                        iconClassName="text-blue-500"
                    />
                    <SummaryCard
                        icon={BadgeCheck}
                        label="Order Lunas"
                        value={summary.paid_orders.toLocaleString('id-ID')}
                        iconClassName="text-green-500"
                    />
                    <SummaryCard
                        icon={CircleDollarSign}
                        label="Total Pendapatan"
                        value={formatIDR(summary.total_revenue)}
                        iconClassName="text-purple-500"
                    />
                    {is_admin && summary.total_fee !== undefined && (
                        <SummaryCard
                            icon={TrendingUp}
                            label="Total Fee (3%)"
                            value={formatIDR(summary.total_fee)}
                            iconClassName="text-amber-500"
                            highlight
                        />
                    )}
                </div>

                {/* Filters */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="pt-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[220px] flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="orders-search"
                                    placeholder="Cari no. order, nama, email…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    onBlur={() => search !== (filters.search ?? '') && applyFilters()}
                                    className="pl-9"
                                />
                            </div>

                            <Select
                                value={filters.event_id ?? 'all'}
                                onValueChange={(v) => applyFilters({ event_id: v === 'all' ? undefined : v })}
                            >
                                <SelectTrigger id="orders-filter-event" className="w-[200px]">
                                    <CalendarDays className="mr-2 size-4 text-muted-foreground" />
                                    <SelectValue placeholder="Semua Event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Event</SelectItem>
                                    {events.map((e) => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            {e.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(v) => applyFilters({ status: v === 'all' ? undefined : v })}
                            >
                                <SelectTrigger id="orders-filter-status" className="w-[160px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="paid">Lunas</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                    <SelectItem value="expired">Kedaluwarsa</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                id="orders-filter-date-from"
                                type="date"
                                title="Dari tanggal"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                onBlur={() => applyFilters({ date_from: dateFrom || undefined })}
                                className="w-[160px]"
                            />

                            <Input
                                id="orders-filter-date-to"
                                type="date"
                                title="Sampai tanggal"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                onBlur={() => applyFilters({ date_to: dateTo || undefined })}
                                className="w-[160px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-4">No. Order</TableHead>
                                    <TableHead>Event</TableHead>
                                    {is_admin && <TableHead>Vendor</TableHead>}
                                    <TableHead>Pembeli</TableHead>
                                    <TableHead className="text-center">Tiket</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    {is_admin && <TableHead className="text-right">Fee (3%)</TableHead>}
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="pr-4">Tanggal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={is_admin ? 9 : 7}
                                            className="py-16 text-center text-muted-foreground"
                                        >
                                            Tidak ada order yang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.data.map((order) => {
                                        const sc = STATUS_CONFIG[order.status];
                                        const StatusIcon = sc.icon;
                                        return (
                                            <TableRow key={order.id} className="group">
                                                <TableCell className="pl-4">
                                                    <Link
                                                        href={`/orders/${order.order_number}`}
                                                        className="font-mono text-xs font-semibold text-primary hover:underline"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="max-w-[180px]">
                                                    <p className="truncate text-sm font-medium">{order.event.title}</p>
                                                </TableCell>
                                                {is_admin && (
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {order.vendor_name}
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <p className="text-sm font-medium">{order.buyer_name}</p>
                                                    <p className="text-xs text-muted-foreground">{order.buyer_email}</p>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                                        {order.items_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm font-semibold">
                                                    {formatIDR(order.total_price)}
                                                </TableCell>
                                                {is_admin && (
                                                    <TableCell className="text-right font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                        {order.fee !== undefined ? formatIDR(order.fee) : '-'}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-center">
                                                    <Badge variant={sc.variant} className="gap-1 text-xs">
                                                        <StatusIcon className="size-3" />
                                                        {sc.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="pr-4 text-xs text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            Menampilkan {orders.from ?? 0}&ndash;{orders.to ?? 0} dari {orders.total} order
                        </p>
                        <div className="flex items-center gap-1">
                            {orders.links.map((link, i) => {
                                if (link.label === '&laquo; Previous') {
                                    return (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                        >
                                            <ChevronLeft className="size-4" />
                                        </Button>
                                    );
                                }
                                if (link.label === 'Next &raquo;') {
                                    return (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
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
                                        className="size-8 text-xs"
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
            </div>
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Orders', href: ordersIndex() },
    ],
};
