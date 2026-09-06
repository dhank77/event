<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class FonnteService
{
    /**
     * Send a WhatsApp message to the specified target using Fonnte API.
     */
    public function send(string $target, string $message): bool
    {
        $target = preg_replace('/[^0-9]/', '', $target);

        if (empty($target)) {
            Log::warning('Fonnte WhatsApp: Target phone number is empty.');

            return false;
        }

        $token = config('services.fonnte.token');

        if (empty($token)) {
            Log::warning('Fonnte WhatsApp notification skipped: FONNTE_TOKEN is not configured.');

            return false;
        }

        $url = config('services.fonnte.url', 'https://api.fonnte.com/send');
        $countryCode = (string) config('services.fonnte.country_code', '62');

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])
                ->connectTimeout(5)
                ->timeout(15)
                ->asForm()
                ->post($url, [
                    'target' => $target,
                    'message' => $message,
                    'countryCode' => $countryCode,
                ]);

            if (! $response->successful()) {
                Log::error('Fonnte WhatsApp send failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'target' => $target,
                ]);

                return false;
            }

            $result = $response->json();

            // Fonnte returns JSON with boolean 'status'
            if (isset($result['status']) && $result['status'] === false) {
                Log::error('Fonnte WhatsApp returned error status', [
                    'response' => $result,
                    'target' => $target,
                ]);

                return false;
            }

            return true;
        } catch (Throwable $e) {
            Log::error('Fonnte WhatsApp request exception: '.$e->getMessage(), [
                'target' => $target,
            ]);

            return false;
        }
    }

    /**
     * Send pending payment WhatsApp notification for an order.
     */
    public function sendOrderPendingNotification(Order $order): bool
    {
        if ($order->wa_pending_sent_at !== null) {
            return false;
        }

        $order->loadMissing(['event', 'items']);

        $itemsList = $order->items->map(function ($item) {
            $priceFormatted = 'Rp '.number_format($item->price, 0, ',', '.');

            return "- {$item->ticket_name} ({$item->quantity}x) @ {$priceFormatted}";
        })->implode("\n");

        $totalFormatted = 'Rp '.number_format($order->total_price, 0, ',', '.');
        $orderUrl = route('orders.show', $order->order_number);
        $paymentUrl = $order->snap_redirect_url ?: $orderUrl;

        $message = "*Halo {$order->buyer_name}!* 👋\n\n"
            .'Terima kasih telah memesan tiket di *'.config('app.name', 'Tiket Event')."*.\n\n"
            ."Pesanan Anda telah dibuat dan saat ini *MENUNGGU PEMBAYARAN*.\n\n"
            ."📋 *DETAIL PESANAN:*\n"
            ."• No. Pesanan: *{$order->order_number}*\n"
            ."• Event: *{$order->event->title}*\n"
            ."• Rincian Tiket:\n{$itemsList}\n"
            ."• Total Pembayaran: *{$totalFormatted}*\n\n"
            ."💳 *LINK PEMBAYARAN:*\n"
            ."Silakan selesaikan pembayaran melalui link berikut:\n"
            ."{$paymentUrl}\n\n"
            ."Anda juga dapat melihat status pesanan di:\n"
            ."{$orderUrl}\n\n"
            .'Harap segera menyelesaikan pembayaran sebelum batas waktu berakhir. Terima kasih! 🙏';

        $sent = $this->send($order->buyer_phone, $message);

        if ($sent) {
            $order->update(['wa_pending_sent_at' => now()]);
        }

        return $sent;
    }

    /**
     * Send payment confirmation WhatsApp notification for an order.
     */
    public function sendOrderPaidNotification(Order $order): bool
    {
        if ($order->wa_paid_sent_at !== null) {
            return false;
        }

        $order->loadMissing(['event', 'items']);

        $itemsList = $order->items->map(function ($item) {
            return "- {$item->ticket_name} ({$item->quantity}x)";
        })->implode("\n");

        $eventTime = '';
        if ($order->event->starts_at) {
            $eventTime = "\n• Waktu: ".$order->event->starts_at->translatedFormat('d F Y, H:i').' WIB';
        }

        $eventLocation = '';
        if ($order->event->location) {
            $eventLocation = "\n• Lokasi: ".$order->event->location;
        } elseif ($order->event->type === 'online') {
            $eventLocation = "\n• Lokasi: Online Event";
        }

        $orderUrl = route('orders.show', $order->order_number);

        $message = "*Halo {$order->buyer_name}!* 🎉\n\n"
            ."Pembayaran untuk pesanan *{$order->order_number}* telah *BERHASIL*!\n\n"
            ."🎫 *DETAIL EVENT & TIKET:*\n"
            ."• Event: *{$order->event->title}*"
            .$eventTime
            .$eventLocation."\n"
            ."• Tiket:\n{$itemsList}\n\n"
            ."🎟️ *E-TICKET / QR CODE:*\n"
            ."E-Ticket dan QR Code masuk Anda sudah aktif dan dapat diakses/diunduh melalui link berikut:\n"
            ."{$orderUrl}\n\n"
            .'Tunjukkan QR Code pada tiket saat registrasi di lokasi acara. Sampai jumpa di event! 🚀';

        $sent = $this->send($order->buyer_phone, $message);

        if ($sent) {
            $order->update(['wa_paid_sent_at' => now()]);
        }

        return $sent;
    }
}
