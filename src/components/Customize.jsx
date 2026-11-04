import { useMemo, useState } from "react";
import { QUESTION_LIMIT } from "../modes";

const QUICK_CHOICES = [5, 10, 15, 20, 25, 35];

// Customize: atur jumlah soal + filter topik (khusus mode dengan
// `topicFilter: true`, yaitu Soal Campuran dan Pilihan Ganda).
export default function Customize({ mode, count, questions = [], onBack, onStart }) {
  // Topik yang tersedia di pool mode ini, diurutkan berdasarkan nomor topik.
  const topics = useMemo(() => {
    const byTopic = new Map();
    for (const question of questions) {
      if (!mode.filter(question)) continue;
      const key = question.topik;
      if (key == null) continue;
      if (!byTopic.has(key)) {
        byTopic.set(key, { topik: key, nama_topik: question.nama_topik ?? `Topik ${key}`, count: 0 });
      }
      byTopic.get(key).count += 1;
    }
    return [...byTopic.values()].sort((a, b) => a.topik - b.topik);
  }, [questions, mode]);

  const showTopicFilter = Boolean(mode.topicFilter) && topics.length > 0;
  const poolSize = count;

  const [selected, setSelected] = useState(() => new Set());
  const [value, setValue] = useState(() => String(Math.min(QUESTION_LIMIT, poolSize)));

  // Pool setelah filter: kosong = semua topik.
  const filteredCount = useMemo(() => {
    if (selected.size === 0) return poolSize;
    let total = 0;
    for (const topic of topics) {
      if (selected.has(topic.topik)) total += topic.count;
    }
    return total;
  }, [selected, topics, poolSize]);

  const max = filteredCount;
  const defaultValue = Math.min(QUESTION_LIMIT, max);

  const parsed = Number.parseInt(value, 10);
  const valid =
    value.trim() !== "" && Number.isFinite(parsed) && parsed >= 1 && parsed <= max;
  const quick = QUICK_CHOICES.filter((n) => n <= max);

  function toggleTopic(topik) {
    const next = new Set(selected);
    if (next.has(topik)) {
      next.delete(topik);
    } else {
      next.add(topik);
    }
    setSelected(next);

    const filtered =
      next.size === 0
        ? poolSize
        : topics.reduce((total, t) => (next.has(t.topik) ? total + t.count : total), 0);

    // Turunkan nilai input bila melebihi pool baru.
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n) && n > filtered) {
      setValue(String(Math.max(filtered, 1)));
    }
  }

  function clearTopics() {
    setSelected(new Set());
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n) && n > poolSize) {
      setValue(String(poolSize));
    }
  }

  if (max === 0 && selected.size === 0 && count === 0) {
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
          Mode ini punya {poolSize} soal di bank. Pilih berapa yang ingin dikerjakan
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

        {showTopicFilter && (
          <div className="topic-filter" role="group" aria-labelledby="topik-label">
            <div className="topic-filter-head">
              <span className="field-label" id="topik-label">
                Filter topik
              </span>
              {selected.size > 0 && (
                <button type="button" className="topic-clear" onClick={clearTopics}>
                  Kosongkan ({selected.size})
                </button>
              )}
            </div>
            <p className="topic-filter-hint">
              Centang topik yang ingin dikerjakan. Kosongkan semua untuk
              mengerjakan semua topik.
            </p>
            <ul className="topic-list">
              {topics.map((topic) => {
                const checked = selected.has(topic.topik);
                return (
                  <li key={topic.topik} className="topic-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTopic(topic.topik)}
                      />
                      <span className="topic-item-text">{topic.nama_topik}</span>
                      <span className="topic-item-count">{topic.count} soal</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {selected.size > 0 && (
              <p className="topic-filter-count" role="status">
                {selected.size} topik dipilih — {filteredCount} soal tersedia.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary customize-start"
          disabled={!valid}
          onClick={() => onStart(parsed, [...selected].sort((a, b) => a - b))}
        >
          Mulai Latihan
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
