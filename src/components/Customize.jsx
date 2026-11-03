import { useState } from "react";
import { QUESTION_LIMIT } from "../modes";

const QUICK_CHOICES = [5, 10, 15, 20, 25, 35];

export default function Customize({ mode, count, onBack, onStart }) {
  const max = count;
  const defaultValue = Math.min(QUESTION_LIMIT, max);
  const [value, setValue] = useState(String(defaultValue));

  const parsed = Number.parseInt(value, 10);
  const valid =
    value.trim() !== "" && Number.isFinite(parsed) && parsed >= 1 && parsed <= max;
  const quick = QUICK_CHOICES.filter((n) => n <= max);

  if (max === 0) {
    return (
      <section className="customize">
        <button type="button" className="back-btn" onClick={onBack}>
          <span aria-hidden="true">←</span> Kembali ke Menu
        </button>
        <div className="state-card" role="status">
          <h1>Belum ada soal</h1>
          <p>
            Belum ada soal untuk mode "{mode.label}". Tambahkan soal tipe
            tersebut ke public/data/soal.json.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="customize">
      <button type="button" className="back-btn" onClick={onBack}>
        <span aria-hidden="true">←</span> Kembali ke Menu
      </button>

      <div className="card customize-card">
        <p className="eyebrow">{mode.label}</p>
        <h1 className="customize-title">Atur jumlah soal</h1>
        <p className="customize-sub">
          Mode ini punya {max} soal di bank. Pilih berapa yang ingin dikerjakan
          — soal diambil secara acak setiap sesi.
        </p>

        <label className="field" htmlFor="jumlah">
          <span className="field-label">Jumlah soal</span>
          <span className="field-row">
            <input
              id="jumlah"
              type="number"
              inputMode="numeric"
              min={1}
              max={max}
              step={1}
              className={`field-input${valid || value.trim() === "" ? "" : " field-input-invalid"}`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-describedby="jumlah-hint jumlah-error"
              aria-invalid={!valid && value.trim() !== ""}
            />
            <span className="field-max">dari {max} soal</span>
          </span>
          <span className="field-hint" id="jumlah-hint">
            Boleh 1–{max} soal. Default {defaultValue}.
          </span>
          {!valid && value.trim() !== "" && (
            <span className="field-error" id="jumlah-error" role="alert">
              Masukkan angka antara 1 dan {max}.
            </span>
          )}
        </label>

        <div className="num-chips" aria-label="Pilihan cepat jumlah soal">
          {quick.map((n) => (
            <button
              key={n}
              type="button"
              className={`num-chip${parsed === n ? " num-chip-active" : ""}`}
              onClick={() => setValue(String(n))}
              aria-pressed={parsed === n}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className={`num-chip${parsed === max ? " num-chip-active" : ""}`}
            onClick={() => setValue(String(max))}
            aria-pressed={parsed === max}
          >
            Semua ({max})
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary customize-start"
          disabled={!valid}
          onClick={() => onStart(parsed)}
        >
          Mulai Latihan
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
