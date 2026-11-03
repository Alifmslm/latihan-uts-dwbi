export default function Result({
  total,
  correct,
  modeLabel,
  onRepeat,
  onMenu,
}) {
  const wrong = total - correct;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  const message =
    percent >= 80
      ? "Luar biasa!"
      : percent >= 60
        ? "Bagus, terus tingkatkan!"
        : "Jangan menyerah, coba lagi!";

  return (
    <section className="result">
      <div className="card result-card">
        <p className="eyebrow">{modeLabel} selesai</p>
        <h1>{message}</h1>

        <div
          className="score-ring"
          style={{ "--score": `${percent * 3.6}deg` }}
          role="img"
          aria-label={`Skor ${percent} persen, ${correct} benar dari ${total} soal`}
        >
          <div className="score-inner">
            <strong>{percent}%</strong>
            <span>
              {correct}/{total} benar
            </span>
          </div>
        </div>

        <div className="result-stats">
          <div className="stat stat-correct">
            <span>{correct}</span>
            <small>Benar</small>
          </div>
          <div className="stat stat-wrong">
            <span>{wrong}</span>
            <small>Salah</small>
          </div>
          <div className="stat">
            <span>{total}</span>
            <small>Total soal</small>
          </div>
        </div>

        <div className="result-actions">
          <button type="button" className="btn btn-primary" onClick={onRepeat}>
            Ulangi
          </button>
          <button type="button" className="btn btn-secondary" onClick={onMenu}>
            Kembali ke Menu
          </button>
        </div>
      </div>
    </section>
  );
}
