import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Shell from "../components/layout/Shell.jsx";
import BlastMode from "../components/modes/BlastMode.jsx";
import BlocksMode from "../components/modes/BlocksMode.jsx";
import FlashcardMode from "../components/modes/FlashcardMode.jsx";
import LearnMode from "../components/modes/LearnMode.jsx";
import MatchMode from "../components/modes/MatchMode.jsx";
import ModeGrid from "../components/modes/ModeGrid.jsx";
import TestMode from "../components/modes/TestMode.jsx";
import { getSet } from "../services/api.js";

const modeComponents = {
  flashcards: FlashcardMode,
  learn: LearnMode,
  test: TestMode,
  blocks: BlocksMode,
  blast: BlastMode,
  match: MatchMode
};

const modeTitles = {
  flashcards: "Thẻ ghi nhớ",
  learn: "Học",
  test: "Kiểm tra",
  blocks: "Khối hộp",
  blast: "Blast",
  match: "Ghép thẻ"
};

export default function SetMode() {
  const { id, mode } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const ModeComponent = modeComponents[mode];

  useEffect(() => {
    getSet(id).then(setSet);
  }, [id]);

  const cards = useMemo(() => set?.cards || [], [set]);

  function openMode(nextMode) {
    navigate(`/sets/${id}/modes/${nextMode}`);
  }

  const action = (
    <Link to={`/sets/${id}`} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white font-semibold sm:inline-flex sm:w-auto sm:gap-2 sm:px-4">
      <ArrowLeft size={18} />
      <span className="hidden sm:inline">Bộ từ</span>
    </Link>
  );

  if (!ModeComponent) {
    return <Navigate to={`/sets/${id}`} replace />;
  }

  if (!set) {
    return (
      <Shell action={action}>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">Đang tải...</div>
      </Shell>
    );
  }

  return (
    <Shell action={action}>
      <section className="mb-5 rounded-2xl border border-line bg-white/80 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-black uppercase text-brand">Chế độ học</p>
        <h1 className="mt-1 break-words text-3xl font-black tracking-tight sm:text-4xl">{modeTitles[mode]}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600 sm:text-base">{set.title}</p>
      </section>

      <div className="space-y-5">
        <ModeGrid activeMode={mode} onModeChange={openMode} />
        <ModeComponent set={set} cards={cards} />
      </div>
    </Shell>
  );
}
