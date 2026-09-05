# Panduan Lengkap Integrasi Midtrans Payment Gateway dengan Laravel

Dokumentasi ini menjelaskan langkah-langkah komprehensif untuk mengintegrasikan **Midtrans Payment Gateway** (menggunakan metode **Snap Redirect / Pop-up**) ke dalam aplikasi **Laravel**.

---

## 1. Persiapan Akun Midtrans & Credentials

Sebelum memulai koding, pastikan Anda telah memiliki akun Midtrans:
1. Daftar atau login ke [Midtrans Dashboard](https://account.midtrans.com/login).
2. Pilih mode **Sandbox** untuk tahap pengembangan (Development/Testing).
3. Masuk ke menu **Settings > Access Keys** untuk mengambil informasi berikut:
   - **Merchant ID**
   - **Client Key** (Digunakan di Frontend / JavaScript)
   - **Server Key** (Digunakan di Backend / PHP)

---

## 2. Instalasi Library Midtrans PHP

Buka terminal di root direktori project Laravel Anda, lalu jalankan perintah Composer berikut untuk menginstal package resmi `midtrans/midtrans-php`:

```bash
composer require midtrans/midtrans-php
```

---

## 3. Konfigurasi Environment (`.env`) & Config

Tambahkan credentials Midtrans ke dalam file `.env` aplikasi Laravel Anda:

```env
MIDTRANS_MERCHANT_ID=your_merchant_id
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_IS_PRODUCTION=false
```

Selanjutnya, buat file konfigurasi baru di folder `config/midtrans.php` agar lebih rapi:

```php
<?php

return [
    'merchant_id'  => env('MIDTRANS_MERCHANT_ID'),
    'client_key'   => env('MIDTRANS_CLIENT_KEY'),
    'server_key'   => env('MIDTRANS_SERVER_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => true,
    'is_3ds'       => true,
];
```

---

## 4. Database, Migration & Model

Buat tabel untuk menyimpan data transaksi/pesanan (`orders`) beserta status pembayarannya. Jalankan perintah Artisan:

```bash
php artisan make:migration create_orders_table --create=orders
```

Sesuaikan file migration yang baru dibuat di folder `database/migrations/..._create_orders_table.php`:

```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('number')->unique();
    $table->unsignedBigInteger('total_price');
    $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
    $table->string('snap_token')->nullable();
    $table->timestamps();
});
```

Jalankan migrasi database:
```bash
php artisan migrate
```

Buat model `Order`:
```bash
php artisan make:model Order
```

Di dalam `app/Models/Order.php`:
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'total_price',
        'status',
        'snap_token',
    ];
}
```

---

## 5. Membuat Controller & Integrasi Snap API

Buat Controller untuk menangani proses pembuatan order dan pemanggilan Snap Token Midtrans:

```bash
php artisan make:controller OrderController
```

Isi `app/Http/Controllers/OrderController.php` dengan kode berikut:

```php
namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;

class OrderController extends Controller
{
    public function __construct()
    {
        // Konfigurasi Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    // Menampilkan halaman checkout / detail order
    public function show(Order $order)
    {
        // Jika snap_token belum ada, generate baru
        if (!$order->snap_token) {
            $params = [
                'transaction_details' => [
                    'order_id' => $order->number,
                    'gross_amount' => $order->total_price,
                ],
                'customer_details' => [
                    'first_name' => 'John',
                    'last_name' => 'Doe',
                    'email' => 'john.doe@example.com',
                    'phone' => '081234567890',
                ],
            ];

            try {
                $snapToken = Snap::getSnapToken($params);
                $order->snap_token = $snapToken;
                $order->save();
            } catch (\Exception $e) {
                return back()->with('error', $e->getMessage());
            }
        }

        return view('orders.show', compact('order'));
    }

    // Handle webhook / notification dari Midtrans
    public function callback(Request $request)
    {
        $serverKey = config('midtrans.server_key');
        $hashedKey = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        if ($hashedKey !== $request->signature_key) {
            return response()->json(['message' => 'Invalid signature key'], 403);
        }

        $order = Order::where('number', $request->order_id)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $transactionStatus = $request->transaction_status;
        $fraudStatus = $request->fraud_status;

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $order->status = 'pending';
            } else if ($fraudStatus == 'accept') {
                $order->status = 'paid';
            }
        } else if ($transactionStatus == 'settlement') {
            $order->status = 'paid';
        } else if ($transactionStatus == 'pending') {
            $order->status = 'pending';
        } else if ($transactionStatus == 'deny' || $transactionStatus == 'expire' || $transactionStatus == 'cancel') {
            $order->status = 'cancelled';
        }

        $order->save();

        return response()->json(['message' => 'Notification processed successfully']);
    }
}
```

---

## 6. Routing (`routes/web.php` & `routes/api.php`)

Daftarkan routes pada file `routes/web.php`:

```php
use App\Http\Controllers\OrderController;

Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
```

Untuk callback notification dari Midtrans, daftarkan pada `routes/api.php` agar terbebas dari proteksi CSRF Laravel VerifyCsrfToken:

```php
use App\Http\Controllers\OrderController;

Route::post('/midtrans/notification', [OrderController::class, 'callback']);
```

> **Catatan Penting:** Pastikan Anda mengecualikan URL notification ini dari CSRF middleware atau gunakan `routes/api.php` karena Midtrans melakukan HTTP POST request langsung dari server mereka ke aplikasi Anda.

---

## 7. Frontend View (Blade Template dengan Midtrans Snap JS)

Buat view di `resources/views/orders/show.blade.php`:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout Order #{{ $order->number }}</title>
    <!-- Midtrans Snap JS (Sandbox / Production) -->
    <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="{{ config('midtrans.client_key') }}"></script>
</head>
<body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
    <h1>Detail Pesanan: {{ $order->number }}</h1>
    <p>Total Tagihan: <strong>Rp {{ number_format($order->total_price, 0, ',', '.') }}</strong></p>
    <p>Status: <span style="text-transform: uppercase; font-weight: bold;">{{ $order->status }}</span></p>

    @if($order->status == 'pending')
        <button id="pay-button" style="padding: 12px 24px; background-color: #3182ce; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Bayar Sekarang</button>
    @else
        <p style="color: green; font-weight: bold;">Pembayaran telah berhasil diselesaikan!</p>
    @endif

    <script type="text/javascript">
      var payButton = document.getElementById('pay-button');
      if (payButton) {
          payButton.onclick = function () {
              // Trigger Snap popup
              snap.pay('{{ $order->snap_token }}', {
                onSuccess: function(result){
                  alert("Pembayaran berhasil!");
                  console.log(result);
                  location.reload();
                },
                onPending: function(result){
                  alert("Menunggu pembayaran Anda!");
                  console.log(result);
                  location.reload();
                },
                onError: function(result){
                  alert("Pembayaran gagal!");
                  console.log(result);
                  location.reload();
                },
                onClose: function(){
                  alert('Anda menutup popup tanpa menyelesaikan pembayaran');
                }
              });
          };
      }
    </script>
</body>
</html>
```

---

## 8. Pengujian & Local Development (Webhook Tunneling)

1. Jalankan server lokal Laravel:
   ```bash
   php artisan serve
   ```
2. Jika Anda ingin menguji webhook callback secara real-time di komputer lokal (localhost), gunakan tool tunneling seperti **Ngrok**:
   ```bash
   ngrok http 8000
   ```
3. Salin URL HTTPS dari Ngrok (contoh: `https://xxxx.ngrok-free.app`), lalu daftarkan URL tersebut ke **Midtrans Dashboard > Settings > Configuration** pada bagian **Notification URL** dengan format:
   `https://xxxx.ngrok-free.app/api/midtrans/notification`
4. Buka halaman order (`http://127.0.0.1:8000/orders/1`), klik **Bayar Sekarang**, dan lakukan simulasi pembayaran menggunakan kartu uji atau metode pembayaran sandbox yang disediakan Midtrans.
