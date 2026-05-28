import { Check, Flame, Flag, Keyboard, RotateCcw, Settings, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getStudySession, submitStudyAnswer } from "../../services/api.js";
import {
  isSoundEnabled,
  isSpeechEnabled,
  playTone,
  setSoundEnabled,
  setSpeechEnabled,
  speak
} from "../../utils/audio.js";
import { recordStudy } from "../../utils/habits.js";
import { compareMeaning, displayMeaning } from "../../utils/vietnamese.js";
import EmptyState from "./EmptyState.jsx";

const fallbackChoices = ["cấp phát", "thực hiện", "nghỉ hưu", "được xem như", "quan trọng", "đồ uống", "học tập", "người bạn"];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildQuestions(cards) {
  return cards.map((card, index) => {
    const correct = displayMeaning(card.definition);
    const pool = [
      ...cards.filter((item) => item.id !== card.id).map((item) => displayMeaning(item.definition)),
      ...fallbackChoices
    ].reduce((list, choice) => {
      const cleaned = displayMeaning(choice);
      const duplicate = list.some((item) => compareMeaning(item, cleaned));
      if (!duplicate && !compareMeaning(cleaned, correct)) list.push(cleaned);
      return list;
    }, []);

    return {
      ...card,
      questionNo: index + 1,
      choices: shuffle([correct, ...shuffle(pool).slice(0, 3)])
    };
  });
}

export default function LearnMode({ set, cards }) {
  const [sessionCards, setSessionCards] = useState(cards);
  const questions = useMemo(() => buildQuestions(sessionCards), [sessionCards]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [speechOn, setSpeechOn] = useState(isSpeechEnabled());
  const card = questions[index];

  useEffect(() => {
    getStudySession(set.id)
      .then((data) => {
        setSessionCards(data.length ? data : cards);
        setIndex(0);
        setSelected("");
        setAnswered(false);
      })
      .catch(() => setSessionCards(cards));
  }, [set.id, cards]);

  useEffect(() => {
    if (card && speechOn && !answered) speak(card.term, set.sourceLanguage, { auto: true });
  }, [card?.id, speechOn, answered, set.sourceLanguage]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!card) return;
      if (event.key >= "1" && event.key <= "4" && !answered) {
        const choice = card.choices[Number(event.key) - 1];
        if (choice) choose(choice);
      }
      if (event.key === "Enter" && answered) next();
      if (event.code === "Space") {
        event.preventDefault();
        speak(card.term, set.sourceLanguage);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!cards.length) return <EmptyState />;

  const isComplete = index >= questions.length;
  const progress = isComplete ? 100 : (index / questions.length) * 100;
  const xp = correctCount * 12 + combo * 3;

  async function choose(choice) {
    if (answered || !card) return;
    const isCorrect = compareMeaning(choice, card.definition);
    setSelected(choice);
    setAnswered(true);
    setCorrectCount((current) => current + (isCorrect ? 1 : 0));
    setMissedCount((current) => current + (isCorrect ? 0 : 1));
    setCombo((current) => (isCorrect ? current + 1 : 0));
    playTone(isCorrect ? "correct" : "wrong");
    recordStudy(1, isCorrect ? 12 : 5);
    await submitStudyAnswer({ setId: set.id, cardId: card.id, isCorrect });
  }

  async function dontKnow() {
    if (answered || !card) return;
    setSelected("");
    setAnswered(true);
    setMissedCount((current) => current + 1);
    setCombo(0);
    playTone("wrong");
    recordStudy(1, 3);
    await submitStudyAnswer({ setId: set.id, cardId: card.id, isCorrect: false });
  }

  function next() {
    setIndex((current) => current + 1);
    setSelected("");
    setAnswered(false);
    playTone("tap");
  }

  function restart() {
    setIndex(0);
    setSelected("");
    setAnswered(false);
    setCorrectCount(0);
    setMissedCount(0);
    setCombo(0);
    setSessionCards(shuffle(sessionCards));
    playTone("match");
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playTone("tap");
  }

  function toggleSpeech() {
    const next = !speechOn;
    setSpeechOn(next);
    setSpeechEnabled(next);
  }

  if (isComplete) {
    return (
      <section className="mx-auto max-w-4xl rounded-2xl border border-line bg-white p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint/10 text-mint">
          <Check size={34} />
        </div>
        <h2 className="mt-5 text-2xl font-black sm:text-3xl">Hoàn thành lượt học</h2>
        <p className="mt-2 text-slate-600">
          Đúng {correctCount}/{questions.length}, cần ôn lại {missedCount} câu, nhận {xp} XP.
        </p>
        <button onClick={restart} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-white shadow-soft">
          <RotateCcw size={18} />
          Học lại
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
            <Flame size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black">Học tập trung</h2>
            <p className="text-sm text-slate-500">Từ khó được ưu tiên ôn lại trước.</p>
          </div>
        </div>
        <div className="relative shrink-0">
          <button onClick={() => setShowSettings((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white">
            <Settings size={18} />
          </button>
          {showSettings && (
            <div className="absolute right-0 top-12 z-10 w-64 rounded-2xl border border-line bg-white p-3 shadow-soft">
              <button onClick={toggleSound} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold hover:bg-cloud">
                Âm thanh hiệu ứng
                {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
              <button onClick={toggleSpeech} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold hover:bg-cloud">
                Tự phát âm
                {speechOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
              <div className="mt-2 rounded-xl bg-cloud p-3 text-xs font-semibold text-slate-500">
                Phím tắt: 1-4 chọn đáp án, Space phát âm, Enter tiếp tục.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-full text-base font-black text-white sm:h-11 sm:w-11 ${missedCount ? "bg-orange-600" : "bg-emerald-600"}`}>
          {correctCount}
        </span>
        <div className="h-4 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-base font-black text-slate-700 sm:h-11 sm:w-11">
          {questions.length}
        </span>
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
              Thuật ngữ
              <button onClick={() => speak(card.term, set.sourceLanguage)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-cloud hover:text-brand" title="Phát âm">
                <Volume2 size={17} />
              </button>
            </div>
            <p className="mt-6 break-words text-3xl font-semibold text-ink sm:text-4xl">{card.term}</p>
            {card.example && <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{card.example}</p>}
          </div>
          <div className="shrink-0 text-right">
            <div className="rounded-full bg-cloud px-3 py-1 text-sm font-bold text-slate-500">
              {card.questionNo}/{questions.length}
            </div>
            <div className="mt-2 rounded-full bg-amber/15 px-3 py-1 text-sm font-black text-amber">
              {xp} XP
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="font-bold text-slate-600">{answered ? "Kết quả" : "Chọn đáp án đúng"}</p>
          <div className="hidden items-center gap-2 rounded-full bg-cloud px-3 py-1 text-xs font-bold text-slate-500 sm:inline-flex">
            <Keyboard size={14} />
            1-4
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {card.choices.map((choice, choiceIndex) => {
            const isCorrect = compareMeaning(choice, card.definition);
            const isSelected = compareMeaning(choice, selected);
            const muted = answered && !isCorrect && !isSelected;
            const stateClass =
              answered && isCorrect
                ? "border-emerald-600 bg-emerald-50 text-ink ring-2 ring-emerald-600/20"
                : answered && isSelected
                  ? "border-orange-500 bg-orange-50 text-ink ring-2 ring-orange-500/20"
                  : muted
                    ? "border-line bg-white text-slate-400 opacity-60"
                    : "border-line bg-white text-ink hover:border-brand hover:shadow-sm";

            return (
              <button
                key={`${card.id}-${choice}`}
                onClick={() => choose(choice)}
                className={`flex min-h-16 items-center gap-4 rounded-xl border px-4 py-3 text-left text-base font-bold transition active:scale-[0.99] sm:min-h-20 sm:gap-5 sm:px-5 sm:text-lg ${stateClass}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${
                  answered && isCorrect
                    ? "bg-emerald-600 text-white"
                    : answered && isSelected
                      ? "bg-orange-600 text-white"
                      : "bg-cloud text-slate-500"
                }`}>
                  {answered && isCorrect ? <Check size={18} /> : answered && isSelected ? <X size={18} /> : choiceIndex + 1}
                </span>
                <span className="break-words">{choice}</span>
              </button>
            );
          })}
        </div>

        {answered ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={`font-bold ${compareMeaning(selected, card.definition) ? "text-emerald-700" : "text-orange-700"}`}>
              {compareMeaning(selected, card.definition) ? "Chính xác. Combo tăng lên!" : "Đừng lo, câu này sẽ được ôn lại sớm."}
            </p>
            <button onClick={next} className="rounded-xl bg-brand px-7 py-3 font-black text-white shadow-soft transition active:scale-[0.98]">
              Tiếp tục
            </button>
          </div>
        ) : (
          <div className="mt-6 flex justify-end">
            <button onClick={dontKnow} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-brand hover:bg-brand/10">
              <Flag size={16} />
              Bạn không biết?
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
