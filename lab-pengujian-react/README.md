# Sistem Informasi Manajemen Laboratorium FTI UII

Sistem aplikasi berbasis web untuk mengelola penerimaan, pelacakan, dan pelaporan hasil pengujian laboratorium di lingkungan Fakultas Teknologi Industri (FTI) Universitas Islam Indonesia.

Aplikasi ini mencakup tiga laboratorium utama:
1. **Lab Manufaktur & Pengujian Tekstil**
2. **Lab Penelitian Teknik Kimia**
3. **Lab Forensik Digital**

![Status](https://img.shields.io/badge/Status-Development-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC)
![Backend](https://img.shields.io/badge/Backend%20Ready-Laravel%2012-FF2D20)

---

## 📋 Fitur Utama

### 1. Multi-Role Authentication
Sistem membedakan akses berdasarkan peran pengguna:
- **Admin**: Memantau statistik global, mengelola pengaturan lab, melihat semua data.
- **Petugas Lab**: Menerima sampel, memverifikasi pembayaran, update status awal.
- **Analis Lab**: Melakukan pengujian, menginput hasil, update status teknis.
- **Customer**: Mengajukan permintaan uji, tracking status, unduh hasil (Login via Google).

### 2. Manajemen Permintaan Uji
- Form pengajuan permintaan yang intuitif (Wizard Step).
- **Auto-Generate Kode Sampel**: Sistem otomatis membuat kode unik (contoh: `PKA-251120-101`) berdasarkan jenis uji dan tanggal.
- Upload foto kondisi sampel.

### 3. Monitoring & Tracking
- Dashboard statistik visual (Grafik batang & kartu ringkasan).
- Filter data canggih (Berdasarkan Status, No Request, atau Customer).
- Notifikasi real-time (Simulasi) untuk update status pengujian.

### 4. Pelaporan
- Export data pengujian ke **Excel** dan **PDF**.
- Detail modal untuk melihat rincian request tanpa berpindah halaman.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Router**: React Router DOM v6

### Backend (Architecture)
Aplikasi ini dirancang menggunakan pola **Headless**.
- **Default Mode**: Menggunakan **Mock Database Service** (`In-Memory`). Bisa langsung dijalankan tanpa setup backend.
- **Production Mode**: Siap terintegrasi dengan **Laravel 12 API**.

---

## 🚀 Cara Menjalankan (Quick Start)

Pastikan Anda memiliki **Node.js** (versi 16+) terinstal di komputer Anda.

### 1. Instalasi Dependensi
Buka terminal di folder proyek dan jalankan:

```bash
npm install
```

### 2. Jalankan Aplikasi
Untuk menjalankan server development lokal:

```bash
npm run dev
```

Buka browser dan akses alamat yang muncul (biasanya `http://localhost:5173`).

---

## 🔑 Akun Demo (Mock Data)

Gunakan kredensial berikut untuk mencoba berbagai role di aplikasi saat mode Mock aktif:

### 1. Role Internal (Staff & Admin)
Gunakan form login sebelah kiri (Tab "Staff & Admin UII").

| Role | Email | Password | Lab Akses |
|Data|---|---|---|
| **Admin FTI** | `admin@uii.ac.id` | `admin` | Semua Lab |
| **Petugas Tekstil** | `petugas.tekstil@uii.ac.id` | `123` | Lab Tekstil |
| **Analis Kimia** | `analis.kimia@uii.ac.id` | `123` | Lab Kimia |
| **Analis Forensik** | `analis.forensik@uii.ac.id` | `123` | Lab Forensik |

### 2. Role Customer
Klik tombol **"Sign in with Google"** (Tab "Customer / Umum").
*Note: Ini adalah simulasi login, tidak memerlukan akun Google asli.*

---

## 🔌 Integrasi Backend (Laravel)

Secara default, aplikasi menggunakan data palsu (Mock) agar bisa langsung dicoba. Untuk menghubungkan ke Backend Laravel yang sebenarnya:

1. Siapkan project Laravel (lihat panduan arsitektur terpisah).
2. Buka file `src/services/database.ts`.
3. Ubah konfigurasi berikut:

```typescript
// src/services/database.ts

// Ubah menjadi false untuk mematikan Mock Data dan menggunakan API
const USE_MOCK_DATA = false; 

// Sesuaikan dengan URL API Laravel Anda
const API_BASE_URL = 'http://localhost:8000/api';
```

4. Pastikan backend Laravel sudah menjalankan CORS untuk mengizinkan akses dari port Frontend.

---

## 📂 Struktur Folder

```
src/
├── components/       # Komponen UI reusable (Sidebar, Badge, dll)
├── pages/            # Halaman utama aplikasi
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── NewRequest.tsx
│   └── RequestList.tsx
├── services/         # Logic komunikasi data (Mock & API Wrapper)
│   └── database.ts   # <--- Konfigurasi Backend di sini
├── App.tsx           # Main Router & Layout Logic
├── constants.ts      # Data statis (Daftar Lab, Jenis Uji)
└── types.ts          # Definisi Tipe Data TypeScript
```

---

## © Hak Cipta

Dikembangkan untuk keperluan Laboratorium FTI UII.
```