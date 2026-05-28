import { RotateCcw, Timer, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { playTone } from "../../utils/audio.js";
import { formatDuration, recordStudy, saveBestMatch } from "../../utils/habits.js";
import { displayMeaning } from "../../utils/vietnamese.js";
import EmptyState from "./EmptyState.jsx";

function makeTiles(cards) {
  return cards
    .slice(0, 10)
    .flatMap((card) => [
      { id: `${card.id}-term`, pairId: card.id, text: card.term, type: "term" },
      { id: `${card.id}-definition`, pairId: card.id, text: displayMeaning(card.definition), type: "definition" }
    ])
    .sort(() => Math.random() - 0.5);
}

export default function MatchMode({ cards }) {
  const [tiles, setTiles] = useState(() => makeTiles(cards));
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finishedMs, setFinishedMs] = useState(null);

  useEffect(() => {
    setTiles(makeTiles(cards));
    setSelected([]);
    setMatched([]);
    setMistakes(0);
    setStartedAt(null);
    setElapsed(0);
    setFinishedMs(null);
  }, [cards]);

  useEffect(() => {
    if (!startedAt || finishedMs) return;
    const timer = setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(timer);
  }, [startedAt, finishedMs]);

  if (!cards.length) return <EmptyState />;

  const complete = matched.length === Math.min(cards.length, 10);
  const score = Math.max(0, 1000 - mistakes * 60 - Math.floor((finishedMs || elapsed) / 1000) * 8);

  function select(tile) {
    if (!startedAt) setStartedAt(Date.now());
    if (finishedMs || matched.includes(tile.pairId) || selected.some((item) => item.id === tile.id)) return;

    const next = [...selected, tile].slice(-2);
    setSelected(next);

    if (next.length === 2) {
      if (next[0].pairId === next[1].pairId && next[0].type !== next[1].type) {
        const nextMatched = [...matched, tile.pairId];
        setMatched(nextMatched);
        playTone("match");

        if (nextMatched.length === Math.min(cards.length, 10)) {
          const duration = Date.now() - (startedAt || Date.now());
          setFinishedMs(duration);
          saveBestMatch(duration);
          recordStudy(nextMatched.length, Math.max(25, Math.round(score / 20)));
          playTone("correct");
        }
      } else {
        setMistakes((current) => current + 1);
        playTone("wrong");
      }
      setTimeout(() => setSelected([]), 420);
    } else {
      playTone("tap");
    }
  }

  function restart() {
    setTiles(makeTiles(cards));
    setSelected([]);
    setMatched([]);
    setMistakes(0);
    setStartedAt(null);
    setElapsed(0);
    setFinishedMs(null);
    playTone("tap");
  }

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Ghép thẻ</h2>
          <p className="text-sm text-slate-500">Chơi nhanh 1-2 phút để não ôn lại nghĩa mà không bị nặng.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-cloud px-3 py-1 text-sm font-bold text-slate-600">
            <Timer size={16} />
            {formatDuration(finishedMs || elapsed)}
          </span>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">Sai {mistakes}</span>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-black text-brand">{score} điểm</span>
        </div>
      </div>

      {complete && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white">
                <Trophy size={22} />
              </div>
              <div>
                <p className="font-black text-emerald-800">Hoàn thành trong {formatDuration(finishedMs)}</p>
                <p className="text-sm font-semibold text-emerald-700">Điểm {score}, sai {mistakes} lần. Kỷ lục đã được lưu nếu tốt hơn.</p>
              </div>
            </div>
            <button onClick={restart} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white">
              <RotateCcw size={17} />
              Chơi lại
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => {
          const done = matched.includes(tile.pairId);
          const active = selected.some((item) => item.id === tile.id);
          return (
            <button
              key={tile.id}
              onClick={() => select(tile)}
              className={`min-h-24 rounded-lg border p-3 text-center font-bold transition ${
                done
                  ? "scale-95 border-mint bg-mint/10 text-mint opacity-60"
                  : active
                    ? "border-brand bg-brand/10 shadow-soft"
                    : "border-line bg-cloud hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
              }`}
            >
              {tile.text}
            </button>
          );
        })}
      </div>
    </section>
  );
}
