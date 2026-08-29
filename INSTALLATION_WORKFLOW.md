# Workflow Instalasi Laravel & Skills

Ringkasan workflow resmi untuk menyiapkan project Laravel event `acarainaja.id` beserta skills dan konvensi yang berlaku di repo ini. Ikuti urutan di bawah saat pertama clone repo, pindah mesin, atau restore environment.

## 1. Prerequisites

Pastikan toolchain berikut tersedia sebelum instalasi:

- PHP `8.5.x` (project berjalan di PHP 8.5.8)
- Composer `2.9.x`
- Node.js `22.x` dan npm `10.x`
- Database MySQL (project saat ini mengacu pada `database_event`)
- Git

Verifikasi cepat:

```bash
php -v
composer --version
node --version
npm --version
```

## 2. Clone & Masuk ke Project

```bash
git clone <repository-url>
cd event
```

## 3. Salin Environment

```bash
cp .env.example .env
```

Edit `.env` sesuai environment lokal, terutama:

- `APP_NAME`
- `APP_KEY` (akan digenerate otomatis)
- `APP_URL`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `SESSION_DRIVER`
- `QUEUE_CONNECTION`
- `CACHE_STORE`
- `MAIL_*`
- `VITE_APP_NAME`

Pastikan database yang dituju sudah dibuat sebelum migrasi.

## 4. Instalasi Dependency

```bash
composer install
npm install
```

## 5. Generate Application Key

```bash
php artisan key:generate
```

## 6. Migrasi Database

```bash
php artisan migrate --force
```

Untuk local development tanpa MySQL, bisa mengganti konfigurasi ke SQLite terlebih dahulu di `.env`, memastikan file `database/database.sqlite` ada, lalu menjalankan migrasi biasa.

## 7. Build Assets

```bash
npm run build
```

Untuk development berulang:

```bash
composer run dev
```

## 8. Menjalankan Dev Server

```bash
composer run dev
```

Jika frontend tidak terlihat setelah perubahan, jalukan salah satu:

```bash
npm run dev
npm run build
composer run dev
```

## 9. Verifikasi Ringkas

- Cek route:

```bash
php artisan route:list --except-vendor
```

- Jalankan CI checks:

```bash
composer ci:check
```

- Jalankan test:

```bash
php artisan test --compact
```

## 10. Skills yang Berlaku di Project

Project ini mengaktifkan skills melalui `boost.json`. Skill yang aktif:

- `infer-conventions`
- `fortify-development`
- `inertia-react-development`
- `laravel-best-practices`
- `laravel-specialist`
- `tailwindcss-development`
- `testing-best-practices`
- `wayfinder-development`

Selain itu, repo ini juga menyimpan skills tambahan di:

- `.agents/skills`
- `.ai/skills`

Beberapa skills terinstal melalui GitHub source dan tercatat di `skills-lock.json`, antara lain:

- `migrate-radix-to-base`
- `shadcn`

## 11. Catatan Penting

- Setiap perubahan pada file PHP sebaiknya diformat dengan:

```bash
vendor/bin/pint --dirty --format agent
```

- Proyek menggunakan Pest untuk testing.
- Gunakan `php artisan make:` untuk membuat komponen Laravel standar.
- Gunakan `search-docs` sebelum mengandalkan API Laravel atau package yang versinya spesifik.
