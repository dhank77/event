<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventCoupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EventCouponController extends Controller
{
    /**
     * Store a new coupon for the event.
     */
    public function store(Request $request, Event $event): RedirectResponse
    {
        abort_if($request->user()?->role !== 'vendor', 403);
        abort_if($event->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'alpha_num', Rule::unique('event_coupons')->where('event_id', $event->id)],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'min_purchase' => ['nullable', 'integer', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_active' => ['boolean'],
        ]);

        if ($validated['type'] === 'percentage') {
            abort_if($validated['value'] > 100, 422, 'Persentase tidak boleh melebihi 100.');
        }

        $event->coupons()->create([
            ...$validated,
            'code' => strtoupper($validated['code']),
            'min_purchase' => $validated['min_purchase'] ?? 0,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kupon berhasil dibuat.']);

        return back();
    }

    /**
     * Update an existing coupon.
     */
    public function update(Request $request, Event $event, EventCoupon $coupon): RedirectResponse
    {
        abort_if($request->user()?->role !== 'vendor', 403);
        abort_if($event->user_id !== $request->user()->id, 403);
        abort_if($coupon->event_id !== $event->id, 404);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'alpha_num', Rule::unique('event_coupons')->where('event_id', $event->id)->ignore($coupon->id)],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'min_purchase' => ['nullable', 'integer', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_active' => ['boolean'],
        ]);

        if ($validated['type'] === 'percentage') {
            abort_if($validated['value'] > 100, 422, 'Persentase tidak boleh melebihi 100.');
        }

        $coupon->update([
            ...$validated,
            'code' => strtoupper($validated['code']),
            'min_purchase' => $validated['min_purchase'] ?? 0,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kupon berhasil diperbarui.']);

        return back();
    }

    /**
     * Delete a coupon.
     */
    public function destroy(Request $request, Event $event, EventCoupon $coupon): RedirectResponse
    {
        abort_if($request->user()?->role !== 'vendor', 403);
        abort_if($event->user_id !== $request->user()->id, 403);
        abort_if($coupon->event_id !== $event->id, 404);

        $coupon->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Kupon berhasil dihapus.']);

        return back();
    }
}
