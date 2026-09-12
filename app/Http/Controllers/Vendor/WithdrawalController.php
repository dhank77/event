<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        abort_unless(in_array($user->role, ['admin', 'vendor']), 403);

        // Calculate finances
        if ($isAdmin) {
            $grossRevenue = (int) Order::where('status', 'paid')->sum('total_price');
            $platformFee = (int) round($grossRevenue * 0.03);
            $netEarnings = $grossRevenue - $platformFee;
            $totalApproved = (int) Withdrawal::where('status', 'approved')->sum('amount');
            $totalPending = (int) Withdrawal::where('status', 'pending')->sum('amount');
            $availableBalance = max(0, $netEarnings - $totalApproved - $totalPending);
        } else {
            $grossRevenue = (int) Order::whereHas('event', fn ($q) => $q->where('user_id', $user->id))
                ->where('status', 'paid')
                ->sum('total_price');
            $platformFee = (int) round($grossRevenue * 0.03);
            $netEarnings = $grossRevenue - $platformFee;
            $totalApproved = (int) Withdrawal::where('user_id', $user->id)->where('status', 'approved')->sum('amount');
            $totalPending = (int) Withdrawal::where('user_id', $user->id)->where('status', 'pending')->sum('amount');
            $availableBalance = max(0, $netEarnings - $totalApproved - $totalPending);
        }

        // Query withdrawals
        $query = Withdrawal::with('user');

        if (! $isAdmin) {
            $query->where('user_id', $user->id);
        } elseif ($request->filled('vendor_id')) {
            $query->where('user_id', $request->integer('vendor_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $withdrawals = $query->latest()->paginate(15)->withQueryString();

        $vendors = $isAdmin
            ? User::where('role', 'vendor')->select('id', 'name', 'email')->orderBy('name')->get()
            : [];

        return Inertia::render('vendor/withdrawals/index', [
            'withdrawals' => $withdrawals->through(fn (Withdrawal $w) => [
                'id' => $w->id,
                'amount' => $w->amount,
                'bank_name' => $w->bank_name,
                'account_number' => $w->account_number,
                'account_holder_name' => $w->account_holder_name,
                'status' => $w->status,
                'notes' => $w->notes,
                'approved_at' => $w->approved_at?->format('d M Y H:i'),
                'rejected_at' => $w->rejected_at?->format('d M Y H:i'),
                'created_at' => $w->created_at->format('d M Y H:i'),
                'user' => [
                    'id' => $w->user->id,
                    'name' => $w->user->name,
                    'email' => $w->user->email,
                ],
            ]),
            'summary' => [
                'gross_revenue' => $grossRevenue,
                'platform_fee' => $platformFee,
                'net_earnings' => $netEarnings,
                'total_approved' => $totalApproved,
                'total_pending' => $totalPending,
                'available_balance' => $availableBalance,
            ],
            'filters' => $request->only(['status', 'vendor_id']),
            'is_admin' => $isAdmin,
            'vendors' => $vendors,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless(in_array($user->role, ['admin', 'vendor']), 403);

        // Calculate current available balance
        $grossRevenue = (int) Order::whereHas('event', fn ($q) => $q->where('user_id', $user->id))
            ->where('status', 'paid')
            ->sum('total_price');
        $platformFee = (int) round($grossRevenue * 0.03);
        $netEarnings = $grossRevenue - $platformFee;
        $totalApproved = (int) Withdrawal::where('user_id', $user->id)->where('status', 'approved')->sum('amount');
        $totalPending = (int) Withdrawal::where('user_id', $user->id)->where('status', 'pending')->sum('amount');
        $availableBalance = max(0, $netEarnings - $totalApproved - $totalPending);

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:50000', "max:{$availableBalance}"],
            'bank_name' => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'min:5', 'max:50'],
            'account_holder_name' => ['required', 'string', 'min:3', 'max:150'],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'amount.max' => 'Nominal penarikan melebihi saldo yang tersedia (Rp '.number_format($availableBalance, 0, ',', '.').').',
            'amount.min' => 'Nominal penarikan minimal Rp 50.000.',
            'bank_name.required' => 'Nama bank atau e-wallet wajib diisi.',
            'account_number.required' => 'Nomor rekening atau nomor telepon e-wallet wajib diisi.',
            'account_holder_name.required' => 'Nama pemilik rekening wajib diisi.',
        ]);

        Withdrawal::create([
            'user_id' => $user->id,
            'amount' => $validated['amount'],
            'bank_name' => $validated['bank_name'],
            'account_number' => $validated['account_number'],
            'account_holder_name' => $validated['account_holder_name'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Permintaan penarikan dana berhasil diajukan dan sedang diproses.');
    }

    public function update(Request $request, Withdrawal $withdrawal): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->role === 'admin', 403);

        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $updateData = [
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $withdrawal->notes,
        ];

        if ($validated['status'] === 'approved') {
            $updateData['approved_at'] = now();
        } elseif ($validated['status'] === 'rejected') {
            $updateData['rejected_at'] = now();
        }

        $withdrawal->update($updateData);

        $statusText = $validated['status'] === 'approved' ? 'disetujui' : 'ditolak';

        return back()->with('success', "Permintaan penarikan dana berhasil {$statusText}.");
    }
}
