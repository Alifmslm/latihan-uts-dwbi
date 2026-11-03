import { useState } from "react";

export default function MultipleChoice({ question, onAnswered }) {
  const [selected, setSelected] = useState(null);
  const { opsi, jawaban } = question;
  const options = Object.entries(opsi ?? {});
  const answered = selected !== null;

  function choose(letter) {
    if (answered) return;
    setSelected(letter);
    onAnswered(
      letter === jawaban,
      `${String(jawaban).toUpperCase()}. ${opsi[jawaban]}`
    );
  }

  return (
    <div className="options">
      {options.map(([letter, text]) => {
        const isCorrect = letter === jawaban;
        const isSelected = letter === selected;

        let stateClass = "";
        if (answered) {
          if (isCorrect) stateClass = "option-correct";
          else if (isSelected) stateClass = "option-wrong";
          else stateClass = "option-muted";
        }

        return (
          <button
            key={letter}
            type="button"
            className={`option ${stateClass}`}
            onClick={() => choose(letter)}
            disabled={answered}
            aria-pressed={isSelected}
          >
            <span className="option-letter">{letter}</span>
            <span className="option-text">{text}</span>
            {answered && isCorrect && (
              <span className="option-mark" aria-hidden="true">✓</span>
            )}
            {answered && isSelected && !isCorrect && (
              <span className="option-mark" aria-hidden="true">✕</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
