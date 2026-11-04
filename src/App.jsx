import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Menu from "./components/Menu";
import Customize from "./components/Customize";
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

function resolveLimit(poolSize, param) {
  const parsed = Number.parseInt(param ?? "", 10);
  if (!Number.isFinite(parsed)) return Math.min(QUESTION_LIMIT, poolSize);
  return Math.max(1, Math.min(parsed, poolSize));
}

// Filter topik dari query param, mis. topik=1,4 → Set([1, 4]).
// Kosong atau tidak valid → null (semua topik).
function resolveTopics(param) {
  if (!param) return null;
  const ids = param
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return ids.length > 0 ? new Set(ids) : null;
}

function buildSession(questions, mode, limit, topicSet = null) {
  let pool = questions.filter(mode.filter);
  if (topicSet) {
    pool = pool.filter((question) => topicSet.has(question.topik));
  }
  const size = resolveLimit(pool.length, limit);
  return {
    questions: shuffle(pool).slice(0, size),
    screen: "quiz",
    index: 0,
    answers: {},
    poolSize: pool.length,
  };
}

function QuizRoute({ questions }) {
  const { modePath } = useParams();
  const [searchParams] = useSearchParams();
  const mode = modeByPath(modePath);

  if (!mode) return <Navigate to="/" replace />;

  const jumlah = searchParams.get("jumlah") ?? "default";
  const topik = searchParams.get("topik") ?? "";
  return (
    <QuizSession
      key={`${mode.id}-${jumlah}-${topik}`}
      mode={mode}
      questions={questions}
      jumlah={jumlah === "default" ? null : jumlah}
      topik={topik}
    />
  );
}

function QuizSession({ mode, questions, jumlah, topik = "" }) {
  const navigate = useNavigate();
  const backToMenu = () => navigate("/");
  const topicSet = resolveTopics(topik);
  const [session, setSession] = useState(() =>
    buildSession(questions, mode, jumlah, topicSet)
  );

  function restart() {
    setSession(buildSession(questions, mode, jumlah, topicSet));
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
    const emptiedByFilter =
      topicSet !== null && questions.some(mode.filter) && (session.poolSize ?? 0) === 0;
    return (
      <section className="quiz">
        <button type="button" className="back-btn" onClick={backToMenu}>
          <span aria-hidden="true">←</span> Kembali ke Menu
        </button>
        <div className="state-card" role="status">
          <h1>Belum ada soal</h1>
          {emptiedByFilter ? (
            <p>
              Tidak ada soal untuk topik yang dipilih di mode "{mode.label}".
              Kembali ke Menu dan centang topik lain, atau kosongkan filter.
            </p>
          ) : (
            <p>
              Belum ada soal untuk mode "{mode.label}". Tambahkan soal tipe
              tersebut ke public/data/soal.json.
            </p>
          )}
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
  const [selectedMode, setSelectedMode] = useState(null);

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

  const mode = selectedMode ? MODES[selectedMode] : null;

  if (mode) {
    return (
      <Customize
        mode={mode}
        count={counts[selectedMode] ?? 0}
        questions={questions}
        onBack={() => setSelectedMode(null)}
        onStart={(jumlah, topik) =>
          navigate(
            `/quiz/${mode.path}?jumlah=${jumlah}${
              topik?.length ? `&topik=${topik.join(",")}` : ""
            }`
          )
        }
      />
    );
  }

  return (
    <Menu
      modes={MODES}
      counts={counts}
      total={questions.length}
      onSelect={setSelectedMode}
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
