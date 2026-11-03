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
- Setiap sesi mengambil maksimal **35 soal acak** dari bank soal yang sesuai
  mode (bank saat ini: 91 pilihan ganda + 26 drag & drop). Mode Drag & Drop
  memuat 26 soal per sesi karena memang hanya itu yang tersedia.
- Routing dengan `react-router-dom` (HashRouter, aman untuk hosting statis):
  - `/` — menu utama
  - `/quiz/campuran` — soal campuran
  - `/quiz/pilihan-ganda` — pilihan ganda saja
  - `/quiz/drag-drop` — drag & drop saja
- Tombol **← Kembali ke Menu** tersedia di setiap halaman kuis (dan layar
  hasil) untuk kembali ke menu utama kapan pun.
- Soal diacak setiap sesi.
- Tombol **← Sebelumnya** tersedia di setiap soal untuk kembali ke soal
  sebelumnya; jawaban sebelumnya ditampilkan kembali dalam keadaan terkunci
  (termasuk posisi drag & drop dan feedback), dan skor dihitung dari hasil
  masing-masing soal.
- Satu soal per halaman, lengkap dengan progres dan tombol Selanjutnya.
- Feedback benar/salah langsung muncul beserta jawaban yang benar.
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

Field lain seperti `kategori`, `sumber`, `catatan`, dan `jawaban_teks` boleh ada;
aplikasi hanya memakai `kategori` untuk label dan mengabaikan sisanya.

## Catatan

Bank soal saat ini berisi **117 soal**: 91 pilihan ganda (id 1–91) dan 26
drag & drop (id 101–126). Mode Drag & Drop sudah berfungsi penuh.
