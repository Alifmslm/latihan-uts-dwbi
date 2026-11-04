import { useRef, useState } from "react";
import DragDrop from "./DragDrop";
import MultipleChoice from "./MultipleChoice";

export default function Quiz({
  question,
  index,
  total,
  modeLabel,
  onAnswer,
  onNext,
  onPrev,
  onBack,
  review,
}) {
  const [feedback, setFeedback] = useState(() =>
    review
      ? { isCorrect: review.isCorrect, correctAnswer: review.correctAnswer }
      : null
  );
  const answeredRef = useRef(Boolean(review));

  function handleAnswered(isCorrect, correctAnswer = "", details = {}) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setFeedback({ isCorrect, correctAnswer });
    onAnswer(isCorrect, correctAnswer, details);
  }

  const isLast = index + 1 === total;
  const percent = Math.round(((index + 1) / total) * 100);
  const isDragDrop = question.tipe === "drag_drop";

  const hint = feedback
    ? "Lanjut ke soal berikutnya."
    : isDragDrop
      ? "Seret semua item, lalu tekan Periksa Jawaban."
      : "Pilih satu jawaban untuk melanjutkan.";

  return (
    <section className="quiz">
      {onBack && (
        <button type="button" className="back-btn" onClick={onBack}>
          <span aria-hidden="true">←</span> Kembali ke Menu
        </button>
      )}
      <div className="quiz-head">
        <div>
          <p className="eyebrow">{modeLabel}</p>
          <p className="progress-text">
            Soal <strong>{index + 1}</strong> dari {total}
          </p>
        </div>
        <span className="progress-percent">{percent}%</span>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-label="Progres kuis"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        <span className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <article className="card question-card">
        <div className="question-meta">
          <span className={`badge ${isDragDrop ? "badge-dd" : "badge-pg"}`}>
            {isDragDrop ? "Drag & Drop" : "Pilihan Ganda"}
          </span>
          {question.kategori && <span className="category">{question.kategori}</span>}
        </div>

        <h1 className="question-text">{question.soal}</h1>

        {isDragDrop ? (
          <DragDrop question={question} onAnswered={handleAnswered} review={review} />
        ) : (
          <MultipleChoice question={question} onAnswered={handleAnswered} review={review} />
        )}

        {feedback && (
          <div
            className={`feedback ${feedback.isCorrect ? "feedback-correct" : "feedback-wrong"}`}
            role="status"
          >
            <span className="feedback-icon" aria-hidden="true">
              {feedback.isCorrect ? "✓" : "✕"}
            </span>
            <div className="feedback-body">
              <strong>{feedback.isCorrect ? "Benar!" : "Salah."}</strong>
              {feedback.isCorrect ? (
                <p>
                  {isDragDrop
                    ? "Semua pasangan sudah tepat."
                    : "Jawabanmu tepat."}
                </p>
              ) : feedback.correctAnswer ? (
                <p>
                  Jawaban yang benar: <b>{feedback.correctAnswer}</b>
                </p>
              ) : (
                <p>Periksa pasangan yang ditandai merah.</p>
              )}
              {question.penjelasan && (
                <div className="feedback-explanation">
                  <span className="explanation-label">Penjelasan</span>
                  <p>{question.penjelasan}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </article>

      <div className="quiz-footer">
        <p className="hint">{hint}</p>
        <div className="quiz-actions">
          {onPrev && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onPrev}
              disabled={index === 0}
            >
              <span aria-hidden="true">←</span> Sebelumnya
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            disabled={!feedback}
          >
            {isLast ? "Lihat Hasil" : "Selanjutnya"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
