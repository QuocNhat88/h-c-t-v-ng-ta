import { CheckCircle2, Clock, FileCheck2, RotateCcw, Volume2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { playTone, speak } from "../../utils/audio.js";
import { compareMeaning, displayMeaning } from "../../utils/vietnamese.js";
import EmptyState from "./EmptyState.jsx";

const fallbackChoices = ["đồ uống", "thực hiện", "quan trọng", "người bạn", "học tập", "cấp phát"];
const questionTypes = ["written", "choice", "trueFalse"];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function unique(items) {
  return [...new Set(items)];
}

function makeRoundCards(cards, priorityIds = []) {
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const priorityCards = unique(priorityIds).map((id) => cardsById.get(id)).filter(Boolean);
  return [...priorityCards, ...shuffle(cards)];
}

function makeChoices(card, cards) {
  const correct = displayMeaning(card.definition);
  const pool = [...cards.filter((item) => item.id !== card.id).map((item) => displayMeaning(item.definition)), ...fallbackChoices]
    .reduce((list, choice) => {
      const duplicate = list.some((item) => compareMeaning(item, choice));
      if (!duplicate && !compareMeaning(choice, correct)) list.push(choice);
      return list;
    }, []);
  return shuffle([correct, ...shuffle(pool).slice(0, 3)]);
}

function makeStatementDefinition(card, cards) {
  const correct = displayMeaning(card.definition);
  if (Math.random() < 0.5) return correct;

  const distractors = cards
    .filter((item) => item.id !== card.id)
    .map((item) => displayMeaning(item.definition))
    .filter((definition) => !compareMeaning(definition, correct));

  return shuffle(distractors)[0] || correct;
}

function buildQuestions(cards, allCards = cards, round = 0) {
  return cards.map((card, index) => ({
    ...card,
    questionId: `${card.id}-${round}-${index}`,
    type: questionTypes[Math.floor(Math.random() * questionTypes.length)],
    choices: makeChoices(card, allCards),
    statementDefinition: makeStatementDefinition(card, allCards)
  }));
}

export default function TestMode({ set, cards }) {
  const [testCards, setTestCards] = useState(() => makeRoundCards(cards));
  const [round, setRound] = useState(0);
  const [missedIds, setMissedIds] = useState([]);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const questions = useMemo(() => buildQuestions(testCards, cards, round), [cards, round, testCards]);

  useEffect(() => {
    setTestCards(makeRoundCards(cards));
    setRound((current) => current + 1);
    setMissedIds([]);
    setStarted(false);
    setAnswers({});
    setScore(null);
    setSeconds(0);
  }, [cards]);

  useEffect(() => {
    if (!started || score !== null) return;
    const timer = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [started, score]);

  if (!cards.length) return <EmptyState />;

  const answeredCount = Object.keys(answers).filter((key) => answers[key] !== "").length;
  const progress = (answeredCount / questions.length) * 100;

  function grade() {
    const points = questions.reduce((total, question) => total + (isCorrect(question) ? 1 : 0), 0);
    setMissedIds(unique(questions.filter((question) => !isCorrect(question)).map((question) => question.id)));
    setScore(points);
    playTone(points === questions.length ? "correct" : "wrong");
  }

  function restart() {
    setTestCards(makeRoundCards(cards, score !== null ? missedIds : []));
    setRound((current) => current + 1);
    setStarted(false);
    setAnswers({});
    setScore(null);
    setSeconds(0);
    playTone("tap");
  }

  function isCorrect(question) {
    const answer = answers[question.questionId];
    if (question.type === "trueFalse") {
      const statementIsTrue = compareMeaning(question.statementDefinition, question.definition);
      return answer === String(statementIsTrue);
    }
    return compareMeaning(answer || "", question.definition);
  }

  function setAnswer(id, value) {
    setAnswers((current) => ({ ...current, [id]: value }));
    playTone("tap");
  }

  if (!started) {
    return (
      <section className="rounded-xl border border-line bg-white p-8 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Kiểm tra</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Bài kiểm tra tự trộn câu viết, trắc nghiệm và đúng/sai để kiểm tra khả năng nhớ nghĩa thật sự.
            </p>
          </div>
          <FileCheck2 className="text-brand" size={34} />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Stat label="Số câu" value={questions.length} />
          <Stat label="Dạng câu" value="3" />
          <Stat label="Chấm điểm" value="Tự động" />
        </div>
        <button onClick={() => setStarted(true)} className="mt-6 rounded-lg bg-brand px-6 py-3 font-black text-white shadow-soft transition hover:-translate-y-0.5">
          Bắt đầu kiểm tra
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Kiểm tra</h2>
          <p className="text-sm text-slate-500">Hoàn thành tất cả câu rồi chấm điểm.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-cloud px-3 py-1 text-sm font-bold text-slate-600">
            <Clock size={16} />
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </span>
          {score !== null && <span className="rounded-full bg-brand/10 px-3 py-1 font-bold text-brand">{score}/{questions.length}</span>}
        </div>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-cloud">
        <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const checked = score !== null;
          const correct = checked && isCorrect(question);
          return (
            <div key={question.questionId} className={`rounded-lg border p-4 transition ${checked ? (correct ? "border-emerald-200 bg-emerald-50/60" : "border-orange-200 bg-orange-50/60") : "border-line bg-white"}`}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Câu {index + 1}</p>
                  <p className="mt-1 text-xl font-black">{question.term}</p>
                </div>
                <button onClick={() => speak(question.term, set.sourceLanguage)} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-brand">
                  <Volume2 size={17} />
                </button>
              </div>

              {question.type === "choice" && (
                <div className="grid gap-2 md:grid-cols-2">
                  {question.choices.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => setAnswer(question.questionId, choice)}
                      className={`rounded-lg border px-3 py-3 text-left font-semibold transition hover:border-brand ${
                        compareMeaning(answers[question.questionId] || "", choice) ? "border-brand bg-brand/10 text-brand" : "border-line bg-white"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}

              {question.type === "written" && (
                <input
                  value={answers[question.questionId] || ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [question.questionId]: event.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-3 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
                  placeholder="Nhập nghĩa tiếng Việt..."
                />
              )}

              {question.type === "trueFalse" && (
                <div>
                  <p className="mb-3 rounded-lg bg-cloud p-3 font-semibold">{question.term} = {question.statementDefinition}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setAnswer(question.questionId, "true")} className={`rounded-lg border px-4 py-2 font-bold ${answers[question.questionId] === "true" ? "border-brand bg-brand/10 text-brand" : "border-line"}`}>
                      Đúng
                    </button>
                    <button onClick={() => setAnswer(question.questionId, "false")} className={`rounded-lg border px-4 py-2 font-bold ${answers[question.questionId] === "false" ? "border-brand bg-brand/10 text-brand" : "border-line"}`}>
                      Sai
                    </button>
                  </div>
                </div>
              )}

              {checked && (
                <div className={`mt-3 flex items-center gap-2 text-sm font-bold ${correct ? "text-emerald-700" : "text-orange-700"}`}>
                  {correct ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  {correct ? "Đúng" : `Đáp án đúng: ${displayMeaning(question.definition)}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-between gap-3">
        <button onClick={restart} className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-3 font-bold">
          <RotateCcw size={18} />
          Làm lại
        </button>
        <button onClick={grade} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 font-black text-white shadow-soft">
          <CheckCircle2 size={18} />
          Chấm điểm
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-cloud/60 p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-brand">{value}</p>
    </div>
  );
}
