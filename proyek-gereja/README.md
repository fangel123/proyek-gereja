# Sistem Manajemen Gereja v1

Aplikasi web full-stack sederhana untuk manajemen data gereja. Proyek ini dibangun sebagai sarana latihan komprehensif yang mencakup seluruh siklus pengembangan, mulai dari desain database, pembuatan API backend, pengembangan antarmuka frontend, hingga proses deployment ke layanan cloud.

### ✨ Demo Aplikasi

[![Screenshot Aplikasi](./dashboardpage.png)](https://proyek-gereja.vercel.app/)
[![Screenshot Aplikasi](./ibadahpage.png)](https://proyek-gereja.vercel.app/)
[![Screenshot Aplikasi](./ibadahdetailpage.png)](https://proyek-gereja.vercel.app/)
[![Screenshot Aplikasi](./klasifikasipage.png)](https://proyek-gereja.vercel.app/)
[![Screenshot Aplikasi](./analyticpage.png)](https://proyek-gereja.vercel.app/)

**Aplikasi Live:** [proyek-gereja.vercel.app](https://proyek-gereja.vercel.app/)

---

### 🚀 Fitur Utama

- **Autentikasi Admin:** Sistem login dan register yang aman menggunakan **JWT (JSON Web Token)**.
- **Rute Terproteksi:** Halaman-halaman manajemen hanya bisa diakses oleh pengguna yang sudah login.
- **Manajemen Klasifikasi:** Fungsi **CRUD** (Create, Read, Update, Delete) penuh untuk mengelola kategori jemaat (misal: Pemuda, Remaja, Ibu-ibu).
- **Manajemen Ibadah:** Membuat dan melihat jadwal ibadah.
- **Manajemen Agenda:** Kemampuan untuk membuat, mengedit (*inline editing*), dan menghapus susunan acara untuk setiap ibadah.
- **Pencatatan Kehadiran:** Mencatat jumlah kehadiran jemaat berdasarkan klasifikasi pada setiap ibadah.
- **Ekspor Data Profesional:**
  - Mengekspor susunan acara ibadah ke format **PDF**.
  - Mengekspor laporan data kehadiran ke format **Excel (.xlsx)**.
- **Analitik & Visualisasi:** Halaman analitik dengan **grafik garis** untuk memvisualisasikan tren kehadiran.
- **Dashboard Insight:** Halaman utama setelah login yang menampilkan ringkasan data penting, seperti total jemaat minggu ini, ibadah teramai, dll.
- **Desain Responsif:** Tampilan yang dioptimalkan untuk berbagai ukuran layar menggunakan **Tailwind CSS**.
- **Animasi Interaktif:** Animasi yang halus dan menarik menggunakan **Framer Motion**.
- **Notifikasi Toast:** Feedback visual yang informatif menggunakan **React Toastify**.

---

### 🛠️ Tumpukan Teknologi (Tech Stack)

<table>
  <tr>
    <td valign="top"><strong>Frontend</strong></td>
    <td>
      - React.js 19.1.0 <br/>
      - React Router DOM 7.6.2 <br/>
      - Axios 1.10.0 <br/>
      - Tailwind CSS 3.4.17 <br/>
      - Chart.js 4.5.0 (dengan react-chartjs-2 5.3.0) <br/>
      - date-fns 4.1.0 <br/>
      - Framer Motion 12.19.1 <br/>
      - React Icons 5.5.0 <br/>
      - React Select 5.10.1 <br/>
      - React Toastify 11.0.5
    </td>
  </tr>
  <tr>
    <td valign="top"><strong>Backend</strong></td>
    <td>
      - Node.js <br/>
      - Express.js 5.1.0 <br/>
      - PostgreSQL (pg 8.16.2) <br/>
      - JWT (jsonwebtoken 9.0.2) <br/>
      - Bcrypt 6.0.0 <br/>
      - node-pg-migrate 8.0.3 (untuk migrasi database) <br/>
      - pdfmake 0.2.20 (untuk ekspor PDF) <br/>
      - exceljs 4.4.0 (untuk ekspor Excel) <br/>
      - Zod 3.25.67 (untuk validasi schema) <br/>
      - CORS 2.8.5 <br/>
      - dotenv 16.5.0
    </td>
  </tr>
  <tr>
    <td valign="top"><strong>Development Tools</strong></td>
    <td>
      - <strong>Frontend:</strong> PostCSS 8.5.6, Autoprefixer 10.4.21 <br/>
      - <strong>Backend:</strong> Nodemon 3.1.10 <br/>
      - <strong>Testing:</strong> Jest, React Testing Library
    </td>
  </tr>
  <tr>
    <td valign="top"><strong>Deployment</strong></td>
    <td>
      - <strong>Frontend:</strong> Vercel <br/>
      - <strong>Backend:</strong> Railway <br/>
      - <strong>Database:</strong> Railway <br/>
    </td>
  </tr>
</table>

---

### 🏁 Instalasi & Menjalankan Proyek Secara Lokal

Untuk menjalankan proyek ini di mesin lokal Anda, ikuti langkah-langkah berikut:

**Prasyarat:**
- Node.js (v18 atau lebih baru)
- npm atau yarn
- PostgreSQL yang berjalan di komputer Anda

**1. Clone Repository**

```bash
git clone https://github.com/fangel123/proyek-gereja.git
cd proyek-gereja
```

*(Ganti dengan URL repository Anda)*

**2. Setup Backend**

```bash
# Masuk ke folder backend
cd backend

# Instal semua dependensi
npm install

# Buat file .env dari contoh
# (Salin .env.example jika ada, atau buat manual)
# Contoh isi .env:
# DATABASE_URL="postgresql://user:pass@localhost:5432/nama_db" 
# JWT_SECRET="kunci_rahasia_yang_sangat_aman"
# PORT=5001

# Jalankan migrasi untuk membuat semua tabel di database lokal Anda
npm run migrate up

# Jalankan server backend
npm run dev
```

Server backend akan berjalan di `http://localhost:5001`.

**3. Setup Frontend**

```bash
# Buka terminal baru, masuk ke folder frontend
cd frontend

# Instal semua dependensi
npm install

# Buat file .env dari contoh
# Contoh isi .env:
# REACT_APP_API_URL=http://localhost:5001

# Jalankan server development frontend
npm start
```

Aplikasi frontend akan berjalan di `http://localhost:3000` dan siap digunakan.

---

### 📜 Skrip yang Tersedia

**Di dalam folder `backend`:**
- `npm run dev`: Menjalankan server backend dengan Nodemon untuk hot reload.
- `npm run migrate up`: Menjalankan migrasi database ke versi terbaru.
- `npm run migrate down`: Membatalkan migrasi terakhir.
- `npm test`: Menjalankan test suite (belum dikonfigurasi).

**Di dalam folder `frontend`:**
- `npm start`: Menjalankan aplikasi React dalam mode development.
- `npm run build`: Mem-build aplikasi untuk produksi.
- `npm test`: Menjalankan test suite dengan Jest dan React Testing Library.
- `npm run eject`: Mengeluarkan konfigurasi Create React App (tidak dapat diundo).

---

### 🏗️ Struktur Proyek

```
proyek-gereja/
├── backend/
│   ├── index.js              # Entry point server
│   ├── package.json          # Dependencies backend
│   ├── migrations/           # Database migrations
│   └── .env                  # Environment variables
└── frontend/
    ├── src/
    │   ├── components/       # Komponen React
    │   ├── pages/           # Halaman aplikasi
    │   ├── utils/           # Utility functions
    │   └── App.js           # Main App component
    ├── package.json         # Dependencies frontend
    ├── tailwind.config.js   # Konfigurasi Tailwind
    └── .env                 # Environment variables
```

---

### 🔒 Keamanan

- **Autentikasi JWT:** Token aman dengan expiration time
- **Password Hashing:** Menggunakan bcrypt dengan salt rounds
- **Input Validation:** Schema validation menggunakan Zod
- **CORS Protection:** Konfigurasi CORS yang tepat
- **Environment Variables:** Sensitive data disimpan dalam file .env

---

### 📊 Fitur Testing

Proyek ini dilengkapi dengan setup testing menggunakan:
- **Jest:** Test runner dan assertion library
- **React Testing Library:** Testing utilities untuk React components
- **Testing Library User Event:** Simulasi interaksi user

Untuk menjalankan test:
```bash
cd frontend
npm test
```

---

### 🚀 Deployment

**Frontend (Vercel):**
1. Push kode ke repository GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel dashboard
4. Deploy otomatis akan berjalan

**Backend (Railway):**
1. Connect repository ke Railway
2. Set environment variables (DATABASE_URL, JWT_SECRET, dll)
3. Deploy service

---

### 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

---