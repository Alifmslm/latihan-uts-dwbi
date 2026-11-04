# Latihan UTS DWBI

Website latihan UTS Data Warehouse & Business Intelligence dengan React + Vite.
Tanpa backend dan tanpa login.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Build produksi:

```bash
npm run build
npm run preview
```

## Fitur

- 3 mode: Soal Campuran, Pilihan Ganda, dan Drag & Drop.
- Setiap mode punya form **Atur jumlah soal** sebelum mulai: input angka
  (1–maksimal bank mode, mis. 10 soal), tombol cepat 5/10/15/20/25/35, dan
  opsi "Semua". Default 35 soal (dibatasi ukuran bank).
- Mode **Soal Campuran** dan **Pilihan Ganda** punya **Filter topik** di
  bawah form Atur jumlah soal: centang satu atau lebih topik (dengan jumlah
  soal per topik), atau kosongkan semua untuk mengerjakan semua topik.
  Jumlah soal yang dipilih menyesuaikan ukuran pool hasil filter. Filter
  Drag & Drop belum tersedia.
- Routing dengan `react-router-dom` (HashRouter, aman untuk hosting statis):
  - `/` — menu utama
  - `/quiz/campuran?jumlah=10` — soal campuran, 10 soal
  - `/quiz/pilihan-ganda?jumlah=10` — pilihan ganda, 10 soal
  - `/quiz/campuran?jumlah=10&topik=1,4` — hanya topik 1 dan 4
  - `/quiz/drag-drop` — drag & drop, default 35 (dibatasi 26)
  - Parameter `jumlah` opsional; tanpa parameter, default 35 soal.
  - Parameter `topik` opsional; berisi daftar nomor topik, dipisah koma.
    Tanpa parameter, semua topik diikutkan.
- Tombol **← Kembali ke Menu** tersedia di setiap halaman kuis (dan layar
  hasil) untuk kembali ke menu utama kapan pun.
- Soal diacak setiap sesi.
- Tombol **← Sebelumnya** tersedia di setiap soal untuk kembali ke soal
  sebelumnya; jawaban sebelumnya ditampilkan kembali dalam keadaan terkunci
  (termasuk posisi drag & drop dan feedback), dan skor dihitung dari hasil
  masing-masing soal.
- Satu soal per halaman, lengkap dengan progres dan tombol Selanjutnya.
- Feedback benar/salah langsung muncul beserta jawaban yang benar dan
  **penjelasan** (field `penjelasan` di soal.json).
- Skor akhir, jumlah benar/salah, tombol Ulangi dan Kembali ke Menu.
- Drag & drop memakai `@dnd-kit/core` dengan `MouseSensor` + `TouchSensor`
  (mendukung HP, bukan HTML5 drag API).

## Data soal

Semua soal dibaca dari `public/data/soal.json`. Loader menerima dua bentuk:

1. Array of object (sesuai spesifikasi awal).
2. Object `{ "soal": [...] }` (format bank soal yang saat ini dipakai).

Jika field `tipe` tidak ada, soal dianggap `pilihan_ganda`.

### Pilihan ganda

```json
{
  "id": 1,
  "tipe": "pilihan_ganda",
  "kategori": "Data Warehouse & OLAP",
  "soal": "ETL adalah singkatan dari ...",
  "opsi": {
    "a": "Extract, Transform, Load",
    "b": "Evaluate, Test, Launch",
    "c": "Export, Transfer, Link",
    "d": "Extract, Transfer, Log"
  },
  "jawaban": "a"
}
```

### Drag & drop

```json
{
  "id": 101,
  "tipe": "drag_drop",
  "kategori": "Operasi OLAP",
  "soal": "Cocokkan istilah dengan penjelasannya",
  "items": ["Roll-up", "Drill-down", "Slice"],
  "targets": [
    "Agregasi ke level lebih tinggi",
    "Rinci ke level lebih rendah",
    "Filter satu dimensi"
  ],
  "jawaban": {
    "Roll-up": "Agregasi ke level lebih tinggi",
    "Drill-down": "Rinci ke level lebih rendah",
    "Slice": "Filter satu dimensi"
  }
}
```

Field `topik` dan `nama_topik` dipakai oleh Filter topik. Field lain seperti
`kategori`, `sumber`, `catatan`, dan `jawaban_teks` boleh ada; aplikasinya
memakai `kategori` untuk label dan `penjelasan` untuk kotak feedback, sisanya
diabaikan.

## Catatan

Bank soal saat ini berisi **74 soal**: 53 pilihan ganda dan 21
drag & drop. Mode Drag & Drop sudah berfungsi penuh. Semua soal punya field
`penjelasan`, yang ditampilkan di kotak feedback setelah menjawab (dan saat
melihat kembali soal sebelumnya).
