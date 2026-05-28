import { Heart, RotateCcw, Timer, Trophy, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { playTone } from "../../utils/audio.js";
import { recordStudy, saveBestBlast } from "../../utils/habits.js";
import { compareMeaning, displayMeaning } from "../../utils/vietnamese.js";
import EmptyState from "./EmptyState.jsx";

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function BlastMode({ cards }) {
  const deck = useMemo(() => shuffle(cards), [cards]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [seconds, setSeconds] = useState(60);
  const [answer, setAnswer] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const card = deck[index % deck.length];

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          finish();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  if (!cards.length) return <EmptyState />;

  function finish(finalScore = score) {
    setFinished(true);
    saveBestBlast(finalScore);
    recordStudy(Math.min(cards.length, index + 1), Math.max(15, Math.round(finalScore / 10)));
    playTone("match");
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setCombo(0);
    setLives(3);
    setSeconds(60);
    setAnswer("");
    setStarted(false);
    setFinished(false);
    playTone("tap");
  }

  function submit(event) {
    event.preventDefault();
    if (!started) setStarted(true);
    if (finished) return;

    const ok = compareMeaning(answer, card.definition);
    if (ok) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setScore((current) => current + 100 + nextCombo * 15);
      playTone("correct");
    } else {
      const nextLives = lives - 1;
      const nextScore = Math.max(0, score - 35);
      setLives(nextLives);
      setCombo(0);
      setScore(nextScore);
      playTone("wrong");
      if (nextLives <= 0) {
        finish(nextScore);
      }
    }

    setIndex((current) => current + 1);
    setAnswer("");
  }

  if (finished) {
    return (
      <section className="rounded-xl border border-line bg-white p-8 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber/15 text-amber">
          <Trophy size={34} />
        </div>
        <h2 className="mt-5 text-3xl font-black">Blast kết thúc</h2>
        <p className="mt-2 text-slate-600">Bạn đạt {score} điểm. Chơi lại một lượt ngắn nếu còn hứng.</p>
        <button onClick={restart} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 font-black text-white shadow-soft">
          <RotateCcw size={18} />
          Chơi lại
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Blast</h2>
          <p className="text-sm text-slate-500">60 giây trả lời nhanh. Sai 3 lần là kết thúc.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-cloud px-3 py-1 text-sm font-bold">
            <Timer size={16} />
            {seconds}s
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
            <Heart size={16} />
            {lives}
          </span>
          <span className="rounded-full bg-amber/15 px-3 py-1 text-sm font-black text-amber">{score} điểm</span>
        </div>
      </div>

      <div className="rounded-xl bg-ink p-8 text-center text-white shadow-inner">
        <Zap className="mx-auto mb-3 text-amber" size={38} />
        <p className="text-sm font-bold uppercase text-slate-300">Combo x{combo}</p>
        <p className="mt-3 text-6xl font-black">{card.term}</p>
        <p className="mt-6 text-sm text-slate-300">Gõ nghĩa tiếng Việt rồi nhấn Enter</p>
      </div>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-line px-4 py-3 text-lg outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          placeholder={displayMeaning(card.definition)}
        />
        <button className="rounded-lg bg-brand px-6 font-black text-white shadow-soft">Bắn</button>
      </form>
    </section>
  );
}
