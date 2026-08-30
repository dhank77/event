<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventTicketController extends Controller
{
    /**
     * Store a new ticket for the event.
     */
    public function store(Request $request, Event $event): RedirectResponse
    {
        abort_if($request->user()?->role !== 'vendor', 403);
        abort_if($event->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:free,paid'],
            'tier' => ['required', 'in:regular,early_bird,vip,group'],
            'price' => ['required_if:type,paid', 'nullable', 'integer', 'min:0'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'max_per_order' => ['required', 'integer', 'min:1', 'max:100'],
            'sales_start' => ['nullable', 'date'],
            'sales_end' => ['nullable', 'date', 'after_or_equal:sales_start'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        if ($validated['type'] === 'free') {
            $validated['price'] = 0;
        }

        $event->tickets()->create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tiket berhasil ditambahkan.']);

        return back();
    }

    /**
     * Update an existing ticket.
     */
    public function update(Request $request, Event $event, EventTicket $ticket): RedirectResponse
    {
        abort_if($request->user()?->role !== 'vendor', 403);
        abort_if($event->user_id !== $request->user()->id, 403);
        abort_if($ticket->event_id !== $event->id, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:free,paid'],
            'tier' => ['required', 'in:regular,early_bird,vip,group'],
            'price' => ['required_if:type,paid', 'nullable', 'integer', 'min:0'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'max_per_order' => ['required', 'integer', 'min:1', 'max:100'],
            'sales_start' => ['nullable', 'date'],
            'sales_end' => ['nullable', 'date', 'after_or_equal:sales_start'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        if ($validated['type'] === 'free') {
            $validated['price'] = 0;
        }

        $ticket->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tiket berhasil diperbarui.']);

        return back();
    }

    /**
     * Delete a ticket.
     */
    public function destroy(Request $request, Event $event, EventTicket $ticket): RedirectResponse
    {
        abort_if($request->user()?->role !== 'vendor', 403);
        abort_if($event->user_id !== $request->user()->id, 403);
        abort_if($ticket->event_id !== $event->id, 404);

        $ticket->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tiket berhasil dihapus.']);

        return back();
    }
}
