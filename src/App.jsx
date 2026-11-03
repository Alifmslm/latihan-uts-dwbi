import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import Menu from "./components/Menu";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import { MODES, QUESTION_LIMIT, modeByPath } from "./modes";
import { shuffle } from "./utils/shuffle";

function normalizeQuestion(question) {
  return {
    ...question,
    tipe: question.tipe === "drag_drop" ? "drag_drop" : "pilihan_ganda",
  };
}

function buildSession(questions, mode) {
  return {
    questions: shuffle(questions.filter(mode.filter)).slice(
      0,
      QUESTION_LIMIT
    ),
    screen: "quiz",
    index: 0,
    answers: {},
  };
}

function QuizRoute({ questions }) {
  const { modePath } = useParams();
  const mode = modeByPath(modePath);

  if (!mode) return <Navigate to="/" replace />;
  return <QuizSession key={mode.id} mode={mode} questions={questions} />;
}

function QuizSession({ mode, questions }) {
  const navigate = useNavigate();
  const backToMenu = () => navigate("/");
  const [session, setSession] = useState(() => buildSession(questions, mode));

  function restart() {
    setSession(buildSession(questions, mode));
  }

  function handleAnswer(isCorrect, correctAnswer = "", details = {}) {
    setSession((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.index]: {
          isCorrect,
          correctAnswer,
          chosen: details.chosen ?? null,
          placements: details.placements ?? null,
        },
      },
    }));
  }

  function handleNext() {
    setSession((prev) => {
      if (prev.index + 1 >= prev.questions.length) {
        return { ...prev, screen: "result" };
      }
      return { ...prev, index: prev.index + 1 };
    });
  }

  function handlePrev() {
    setSession((prev) => ({ ...prev, index: Math.max(0, prev.index - 1) }));
  }

  if (session.questions.length === 0) {
    return (
      <section className="quiz">
        <button type="button" className="back-btn" onClick={backToMenu}>
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

  const correctCount = Object.values(session.answers).filter(
    (answer) => answer.isCorrect
  ).length;

  if (session.screen === "result") {
    return (
      <Result
        total={session.questions.length}
        correct={correctCount}
        modeLabel={mode.label}
        onRepeat={restart}
        onMenu={backToMenu}
      />
    );
  }

  const currentQuestion = session.questions[session.index];

  return (
    <Quiz
      key={currentQuestion.id}
      question={currentQuestion}
      index={session.index}
      total={session.questions.length}
      modeLabel={mode.label}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onPrev={handlePrev}
      onBack={backToMenu}
      review={session.answers[session.index] ?? null}
    />
  );
}

function MenuRoute({ questions }) {
  const navigate = useNavigate();

  const counts = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(MODES).map(([key, { filter }]) => [
          key,
          questions.filter(filter).length,
        ])
      ),
    [questions]
  );

  return (
    <Menu
      modes={MODES}
      counts={counts}
      total={questions.length}
      onSelect={(modeId) => navigate(`/quiz/${MODES[modeId].path}`)}
    />
  );
}

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");

  async function loadQuestions() {
    setStatus("loading");
    setLoadError("");

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/soal.json`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : payload?.soal;
      if (!Array.isArray(list)) {
        throw new Error("Format soal.json tidak dikenali");
      }

      setQuestions(list.map(normalizeQuestion));
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setLoadError("Soal gagal dimuat. Periksa public/data/soal.json lalu coba lagi.");
      setStatus("error");
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">DW</span>
          <span className="brand-text">
            <span className="brand-title">Latihan UTS</span>
            <span className="brand-sub">Data Warehouse &amp; Business Intelligence</span>
          </span>
        </div>
        <span className="header-chip">Tanpa login</span>
      </header>

      <main className="container">
        {status === "loading" && (
          <div className="state-card" role="status">
            <span className="spinner" aria-hidden="true" />
            <p>Memuat bank soal…</p>
          </div>
        )}

        {status === "error" && (
          <div className="state-card state-error" role="alert">
            <h1>Gagal memuat soal</h1>
            <p>{loadError}</p>
            <button type="button" className="btn btn-primary" onClick={loadQuestions}>
              Coba lagi
            </button>
          </div>
        )}

        {status === "ready" && (
          <Routes>
            <Route path="/" element={<MenuRoute questions={questions} />} />
            <Route path="/quiz/:modePath" element={<QuizRoute questions={questions} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Latihan UTS DWBI · Soal dibaca dari <code>public/data/soal.json</code>
        </p>
      </footer>
    </div>
  );
}
