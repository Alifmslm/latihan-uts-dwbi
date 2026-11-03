import { QUESTION_LIMIT } from "../modes";

const ICONS = {
  campuran: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h10.5a4 4 0 0 1 0 8H9" />
      <path d="M7 4 4 7l3 3" />
      <path d="m14 12 3 3-3 3" />
    </svg>
  ),
  pilihan_ganda: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  ),
  drag_drop: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
      <path d="M11 7h5a2 2 0 0 1 2 2v3" />
      <path d="m15.5 10.5 2.5 2.5 2.5-2.5" />
    </svg>
  ),
};

export default function Menu({ modes, counts, total, onSelect }) {
  return (
    <section className="menu">
      <div className="hero">
        <span className="hero-badge">Latihan UTS · DWBI</span>
        <h1>
          Uji pemahaman <span>Data Warehouse &amp; BI</span>
        </h1>
        <p>
          Pilih mode latihan. Soal diacak setiap sesi, dan kamu langsung tahu jawaban
          benar setelah menjawab.
        </p>
      </div>

      <div className="mode-grid">
        {Object.entries(modes).map(([id, mode]) => {
          const count = counts[id] ?? 0;

          return (
            <button
              key={id}
              type="button"
              className={`mode-card${count === 0 ? " mode-card-empty" : ""}`}
              onClick={() => onSelect(id)}
            >
              <span className="mode-icon">{ICONS[id]}</span>
              <span className="mode-title">{mode.label}</span>
              <span className="mode-desc">{mode.description}</span>
              <span className="mode-meta">
                <span className="mode-count">
                  {count === 0
                    ? "Belum ada soal"
                    : `${Math.min(count, QUESTION_LIMIT)} soal per sesi`}
                </span>
                <span className="mode-arrow" aria-hidden="true">→</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="menu-foot">
        Bank {total} soal · setiap sesi memuat maksimal {QUESTION_LIMIT} soal
        acak
      </p>
    </section>
  );
}
