import { Check, ChevronLeft, ChevronRight, Eye, RotateCcw, Shuffle, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { playTone, speak } from "../../utils/audio.js";
import { displayMeaning } from "../../utils/vietnamese.js";
import EmptyState from "./EmptyState.jsx";

export default function FlashcardMode({ set, cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState(cards.map((_, cardIndex) => cardIndex));
  const [knownIds, setKnownIds] = useState([]);
  const [learningIds, setLearningIds] = useState([]);
  const card = useMemo(() => cards[order[index] || 0], [cards, index, order]);

  useEffect(() => {
    setOrder(cards.map((_, cardIndex) => cardIndex));
    setIndex(0);
    setFlipped(false);
  }, [cards]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!card) return;
      if (event.code === "Space") {
        event.preventDefault();
        flip();
      }
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
      if (event.key.toLowerCase() === "a") mark("learning");
      if (event.key.toLowerCase() === "k") mark("known");
      if (event.key.toLowerCase() === "s") speak(card.term, set.sourceLanguage);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!cards.length) return <EmptyState />;

  const progress = ((index + 1) / cards.length) * 100;

  function flip() {
    setFlipped((value) => !value);
    playTone("flip");
  }

  function next() {
    setIndex((current) => (current + 1) % cards.length);
    setFlipped(false);
    playTone("tap");
  }

  function previous() {
    setIndex((current) => (current - 1 + cards.length) % cards.length);
    setFlipped(false);
    playTone("tap");
  }

  function mark(kind) {
    setKnownIds((current) => current.filter((id) => id !== card.id));
    setLearningIds((current) => current.filter((id) => id !== card.id));
    if (kind === "known") setKnownIds((current) => [...current, card.id]);
    if (kind === "learning") setLearningIds((current) => [...current, card.id]);
    playTone(kind === "known" ? "correct" : "wrong");
    next();
  }

  function shuffleCards() {
    setOrder(cards.map((_, cardIndex) => cardIndex).sort(() => Math.random() - 0.5));
    setIndex(0);
    setFlipped(false);
    playTone("match");
  }

  function reset() {
    setKnownIds([]);
    setLearningIds([]);
    setIndex(0);
    setFlipped(false);
    playTone("tap");
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black">Thẻ ghi nhớ</h2>
          <p className="text-sm leading-5 text-slate-500">Space lật thẻ, A chưa thuộc, K đã thuộc, S phát âm.</p>
        </div>
        <div className="flex gap-2">
          <IconButton onClick={shuffleCards} title="Trộn thẻ" icon={Shuffle} />
          <IconButton onClick={() => speak(card.term, set.sourceLanguage)} title="Phát âm" icon={Volume2} active />
          <IconButton onClick={reset} title="Đặt lại" icon={RotateCcw} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Đang xem" value={`${index + 1}/${cards.length}`} />
        <Stat label="Đã thuộc" value={knownIds.length} tone="text-emerald-700" />
        <Stat label="Cần ôn" value={learningIds.length} tone="text-orange-700" />
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-cloud">
        <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <button
        onClick={flip}
        className="relative h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white via-cloud to-brand/10 text-center shadow-inner transition active:scale-[0.99] sm:h-[380px]"
      >
        <div className={`card-face absolute inset-0 ${flipped ? "flipped" : ""}`}>
          <div className="card-side absolute inset-0 grid place-items-center p-5 sm:p-8">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase text-slate-400">Thuật ngữ</p>
              <p className="mt-4 break-words text-4xl font-black text-ink sm:text-6xl">{card.term}</p>
              {card.example && <p className="mt-5 text-sm leading-6 text-slate-500 sm:text-lg">{card.example}</p>}
              <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm">
                <Eye size={16} />
                Bấm để lật thẻ
              </p>
            </div>
          </div>
          <div className="card-side card-back absolute inset-0 grid place-items-center p-5 sm:p-8">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase text-slate-400">Định nghĩa</p>
              <p className="mt-4 break-words text-3xl font-black text-brand sm:text-5xl">{displayMeaning(card.definition)}</p>
              {card.partOfSpeech && <p className="mt-5 inline-block rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">{card.partOfSpeech}</p>}
            </div>
          </div>
        </div>
      </button>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button onClick={previous} className="grid h-12 place-items-center rounded-xl border border-line bg-white transition active:scale-[0.98] sm:w-12">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="grid h-12 place-items-center rounded-xl border border-line bg-white transition active:scale-[0.98] sm:w-12">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => mark("learning")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-bold text-orange-700 transition active:scale-[0.98]">
            <X size={18} />
            Chưa thuộc
          </button>
          <button onClick={() => mark("known")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white shadow-soft transition active:scale-[0.98]">
            <Check size={18} />
            Đã thuộc
          </button>
        </div>
      </div>
    </section>
  );
}

function IconButton({ icon: Icon, active, ...props }) {
  return (
    <button className={`grid h-11 w-11 place-items-center rounded-xl border border-line bg-white transition active:scale-[0.98] ${active ? "text-brand" : ""}`} {...props}>
      <Icon size={18} />
    </button>
  );
}

function Stat({ label, value, tone = "text-brand" }) {
  return (
    <div className="rounded-xl border border-line bg-cloud/60 p-3">
      <p className="text-[10px] font-bold uppercase text-slate-500 sm:text-xs">{label}</p>
      <p className={`mt-1 text-xl font-black sm:text-2xl ${tone}`}>{value}</p>
    </div>
  );
}
