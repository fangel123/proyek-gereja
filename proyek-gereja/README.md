# Sistem Manajemen Gereja v1

Aplikasi web full-stack sederhana untuk manajemen data gereja. Proyek ini dibangun sebagai sarana latihan komprehensif yang mencakup seluruh siklus pengembangan, mulai dari desain database, pembuatan API backend, pengembangan antarmuka frontend, hingga proses deployment ke layanan cloud.

### ✨ Demo Aplikasi

[![Screenshot Aplikasi](/dashboard.png)](https://proyek-gereja.vercel.app/)

**Aplikasi Live:** [proyek-gereja.vercel.app](https://proyek-gereja.vercel.app/)

---

### 🚀 Fitur Utama

-   **Autentikasi Admin:** Sistem login dan register yang aman menggunakan **JWT (JSON Web Token)**.
-   **Rute Terproteksi:** Halaman-halaman manajemen hanya bisa diakses oleh pengguna yang sudah login.
-   **Manajemen Klasifikasi:** Fungsi **CRUD** (Create, Read, Update, Delete) penuh untuk mengelola kategori jemaat (misal: Pemuda, Remaja, Ibu-ibu).
-   **Manajemen Ibadah:** Membuat dan melihat jadwal ibadah.
-   **Manajemen Agenda:** Kemampuan untuk membuat, mengedit (*inline editing*), dan menghapus susunan acara untuk setiap ibadah.
-   **Pencatatan Kehadiran:** Mencatat jumlah kehadiran jemaat berdasarkan klasifikasi pada setiap ibadah.
-   **Ekspor Data Profesional:**
    -   Mengekspor susunan acara ibadah ke format **PDF**.
    -   Mengekspor laporan data kehadiran ke format **Excel (.xlsx)**.
-   **Analitik & Visualisasi:** Halaman analitik dengan **grafik garis** untuk memvisualisasikan tren kehadiran.
-   **Dashboard Insight:** Halaman utama setelah login yang menampilkan ringkasan data penting, seperti total jemaat minggu ini, ibadah teramai, dll.
-   **Desain Responsif:** Tampilan yang dioptimalkan untuk berbagai ukuran layar menggunakan **Tailwind CSS**.

---

### 🛠️ Tumpukan Teknologi (Tech Stack)

<table>
  <tr>
    <td valign="top"><strong>Frontend</strong></td>
    <td>
      - React.js <br/>
      - React Router DOM <br/>
      - Axios <br/>
      - Tailwind CSS <br/>
      - Chart.js (dengan react-chartjs-2) <br/>
      - date-fns
    </td>
  </tr>
  <tr>
    <td valign="top"><strong>Backend</strong></td>
    <td>
      - Node.js <br/>
      - Express.js <br/>
      - PostgreSQL <br/>
      - JWT (jsonwebtoken) <br/>
      - Bcrypt.js <br/>
      - node-pg-migrate (untuk migrasi database) <br/>
      - pdfmake (untuk ekspor PDF) <br/>
      - exceljs (untuk ekspor Excel)
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
-   Node.js (v18 atau lebih baru)
-   npm atau yarn
-   PostgreSQL yang berjalan di komputer Anda

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
-   `npm run dev`: Menjalankan server backend dengan Nodemon.
-   `npm run migrate up`: Menjalankan migrasi database ke versi terbaru.
-   `npm run migrate down`: Membatalkan migrasi terakhir.

**Di dalam folder `frontend`:**
-   `npm start`: Menjalankan aplikasi React dalam mode development.
-   `npm run build`: Mem-build aplikasi untuk produksi.

---

### 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.