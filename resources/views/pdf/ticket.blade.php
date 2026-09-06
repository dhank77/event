<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>E-Ticket - {{ $order->order_number }}</title>
    <style>
        * {
            box-margin: 0;
            box-padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            font-size: 12px;
            line-height: 1.5;
            padding: 24px;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 20px;
        }
        .logo-box {
            background-color: #f97316;
            color: #ffffff;
            font-weight: bold;
            font-size: 16px;
            padding: 6px 12px;
            display: inline-block;
            border-radius: 4px;
            margin-right: 8px;
        }
        .brand-title {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            vertical-align: middle;
        }
        .badge-status {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
            font-weight: bold;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
        }
        .ticket-box {
            border: 2px solid #0f172a;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        .event-banner-strip {
            background-color: #0f172a;
            color: #ffffff;
            padding: 16px 20px;
        }
        .event-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #ffffff;
        }
        .event-organizer {
            font-size: 12px;
            color: #94a3b8;
        }
        .content-table {
            width: 100%;
            border-collapse: collapse;
        }
        .content-table td {
            padding: 16px 20px;
            vertical-align: top;
        }
        .info-col {
            width: 65%;
            border-right: 2px dashed #cbd5e1;
        }
        .qr-col {
            width: 35%;
            text-align: center;
            background-color: #f8fafc;
        }
        .info-grid {
            width: 100%;
            margin-bottom: 16px;
        }
        .info-grid td {
            padding: 6px 0;
            vertical-align: top;
        }
        .info-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            font-weight: 600;
        }
        .info-value {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 2px;
        }
        .qr-image {
            width: 160px;
            height: 160px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            padding: 6px;
            background-color: #ffffff;
            border-radius: 4px;
        }
        .order-number {
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 1px;
            margin-top: 8px;
        }
        .qr-note {
            font-size: 10px;
            color: #64748b;
            margin-top: 4px;
        }
        .table-items {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11px;
        }
        .table-items th {
            background-color: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
            font-size: 10px;
            text-transform: uppercase;
        }
        .table-items td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .total-row td {
            font-weight: bold;
            font-size: 12px;
            border-top: 2px solid #0f172a;
            color: #0f172a;
        }
        .rules-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 16px;
            font-size: 10px;
            color: #64748b;
            line-height: 1.6;
        }
        .rules-title {
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 4px;
            font-size: 11px;
        }
        .rules-box ul {
            margin-left: 16px;
        }
        .footer-note {
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            margin-top: 20px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td style="vertical-align: middle;">
                <span class="logo-box">AI</span>
                <span class="brand-title">acarainaja.id</span>
            </td>
            <td style="text-align: right; vertical-align: middle;">
                <span class="badge-status">
                    {{ $order->status === 'paid' ? 'LUNAS / VERIFIED' : strtoupper($order->status) }}
                </span>
            </td>
        </tr>
    </table>

    <!-- Ticket Container -->
    <div class="ticket-box">
        <!-- Event Banner Header -->
        <div class="event-banner-strip">
            <div class="event-title">{{ $order->event->title }}</div>
            <div class="event-organizer">
                Diselenggarakan oleh: {{ $order->event->vendor->name ?? $order->event->user->name ?? 'Organizer' }}
                @if($order->event->category)
                    • Kategori: {{ $order->event->category }}
                @endif
                • Tipe: {{ ucfirst($order->event->type) }}
            </div>
        </div>

        <!-- Main Ticket Content -->
        <table class="content-table">
            <tr>
                <!-- Left: Event and Buyer Info -->
                <td class="info-col">
                    <table class="info-grid">
                        <tr>
                            <td style="width: 50%;">
                                <div class="info-label">Waktu Acara</div>
                                <div class="info-value">
                                    {{ $order->event->starts_at ? $order->event->starts_at->translatedFormat('d F Y, H:i') . ' WIB' : 'Akan Diumumkan' }}
                                    @if($order->event->ends_at)
                                        <br><span style="font-weight: normal; font-size: 11px; color: #64748b;">s/d {{ $order->event->ends_at->translatedFormat('d F Y, H:i') }} WIB</span>
                                    @endif
                                </div>
                            </td>
                            <td style="width: 50%;">
                                <div class="info-label">Lokasi / Akses</div>
                                <div class="info-value">
                                    @if($order->event->type === 'online')
                                        Online Platform: {{ $order->event->online_platform ?? 'Link akan dikirim via email' }}
                                    @else
                                        {{ $order->event->location ?? 'Lokasi akan diumumkan' }}
                                    @endif
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 10px;">
                                <div class="info-label">Nama Pemesan</div>
                                <div class="info-value">{{ $order->buyer_name }}</div>
                            </td>
                            <td style="padding-top: 10px;">
                                <div class="info-label">Email & Telepon</div>
                                <div class="info-value">{{ $order->buyer_email }}<br><span style="font-weight: normal; color: #64748b;">{{ $order->buyer_phone }}</span></div>
                            </td>
                        </tr>
                    </table>

                    <!-- Ticket breakdown table -->
                    <div class="info-label" style="margin-top: 8px; margin-bottom: 4px;">Detail Tiket Dipesan</div>
                    <table class="table-items">
                        <thead>
                            <tr>
                                <th>Tiket</th>
                                <th>Kategori</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Harga</th>
                                <th style="text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($order->items as $item)
                                <tr>
                                    <td><strong>{{ $item->ticket_name }}</strong></td>
                                    <td><span style="text-transform: uppercase;">{{ $item->ticket_tier }}</span></td>
                                    <td style="text-align: center;">{{ $item->quantity }}</td>
                                    <td style="text-align: right;">Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                                    <td style="text-align: right;">Rp {{ number_format($item->price * $item->quantity, 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                            <tr class="total-row">
                                <td colspan="4" style="text-align: right;">Total Pembayaran</td>
                                <td style="text-align: right; color: #f97316;">Rp {{ number_format($order->total_price, 0, ',', '.') }}</td>
                            </tr>
                        </tbody>
                    </table>
                </td>

                <!-- Right: QR Code & Check-in Details -->
                <td class="qr-col">
                    <div class="info-label" style="margin-bottom: 6px;">Check-In QR Code</div>
                    <img src="data:image/png;base64,{{ $qrCodeBase64 }}" class="qr-image" alt="QR Code">
                    <div class="order-number">#{{ $order->order_number }}</div>
                    <div class="qr-note">
                        Tunjukkan QR Code ini kepada panitia saat check-in
                    </div>
                    <div style="margin-top: 12px; font-size: 10px; color: #64748b;">
                        Tanggal Order:<br>
                        <strong>{{ $order->created_at->translatedFormat('d M Y, H:i') }} WIB</strong>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Instructions / Terms -->
    <div class="rules-box">
        <div class="rules-title">Syarat & Ketentuan Masuk:</div>
        <ul>
            <li>E-ticket ini merupakan bukti sah pendaftaran dan masuk ke lokasi acara.</li>
            <li>Scan QR Code dilakukan satu kali di pintu masuk atau registrasi ulang panitia.</li>
            <li>Harap siapkan e-ticket ini (cetak atau di layar ponsel) beserta kartu identitas resmi (KTP/SIM/Paspor).</li>
            <li>Dilarang membagikan barcode atau QR Code tiket kepada pihak lain yang tidak berkepentingan.</li>
            <li>Tiket yang sudah dibeli tidak dapat ditukar atau diuangkan kembali kecuali ada pembatalan resmi oleh pihak penyelenggara.</li>
        </ul>
    </div>

    <div class="footer-note">
        Dicetak secara otomatis dari platform acarainaja.id • Butuh bantuan? Hubungi support@acarainaja.id
    </div>

</body>
</html>
