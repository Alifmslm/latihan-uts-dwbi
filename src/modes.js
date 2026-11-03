// Definisi mode latihan + batas jumlah soal per sesi.
// Dipakai oleh routing (App.jsx) dan menu (Menu.jsx).

export const QUESTION_LIMIT = 35;

export const MODES = {
  campuran: {
    id: "campuran",
    path: "campuran",
    label: "Soal Campuran",
    description: "Pilihan ganda dan drag & drop dalam satu sesi.",
    filter: () => true,
  },
  pilihan_ganda: {
    id: "pilihan_ganda",
    path: "pilihan-ganda",
    label: "Pilihan Ganda",
    description: "Latihan memilih satu jawaban yang tepat.",
    filter: (question) => question.tipe === "pilihan_ganda",
  },
  drag_drop: {
    id: "drag_drop",
    path: "drag-drop",
    label: "Drag & Drop",
    description: "Cocokkan istilah dengan penjelasan yang sesuai.",
    filter: (question) => question.tipe === "drag_drop",
  },
};

export function modeByPath(path) {
  return Object.values(MODES).find((mode) => mode.path === path) ?? null;
}
