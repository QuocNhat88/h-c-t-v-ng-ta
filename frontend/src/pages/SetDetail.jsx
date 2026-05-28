import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BulkImport from "../components/BulkImport.jsx";
import CardEditor from "../components/CardEditor.jsx";
import CardManager from "../components/CardManager.jsx";
import ExportMenu from "../components/ExportMenu.jsx";
import Shell from "../components/layout/Shell.jsx";
import SetDashboard from "../components/SetDashboard.jsx";
import ModeGrid from "../components/modes/ModeGrid.jsx";
import { getSet, getStudySummary } from "../services/api.js";

export default function SetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getSet(id).then(setSet);
    getStudySummary(id).then(setSummary).catch(() => setSummary(null));
  }, [id]);

  const cards = useMemo(() => set?.cards || [], [set]);

  function refreshSummary() {
    getStudySummary(id).then(setSummary).catch(() => setSummary(null));
  }

  function addCard(card) {
    setSet((current) => ({ ...current, cards: [...current.cards, card] }));
    refreshSummary();
  }

  function addCards(importedCards) {
    setSet((current) => ({ ...current, cards: [...current.cards, ...importedCards] }));
    refreshSummary();
  }

  function updateCardInSet(card) {
    setSet((current) => ({
      ...current,
      cards: current.cards.map((item) => (item.id === card.id ? { ...item, ...card } : item))
    }));
    refreshSummary();
  }

  function deleteCardFromSet(cardId) {
    setSet((current) => ({
      ...current,
      cards: current.cards.filter((item) => item.id !== cardId)
    }));
    refreshSummary();
  }

  function openMode(mode) {
    navigate(`/sets/${id}/modes/${mode}`);
  }

  const action = set ? (
    <div className="flex items-center gap-2">
      <ExportMenu set={set} />
      <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white font-semibold sm:inline-flex sm:w-auto sm:gap-2 sm:px-4">
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Thư viện</span>
      </Link>
    </div>
  ) : (
    <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white sm:inline-flex sm:w-auto sm:gap-2 sm:px-4">
      <ArrowLeft size={18} />
      <span className="hidden sm:inline">Thư viện</span>
    </Link>
  );

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
        <p className="text-xs font-black uppercase text-brand">Bộ từ vựng</p>
        <h1 className="mt-1 break-words text-3xl font-black tracking-tight sm:text-4xl">{set.title}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600 sm:text-base">{cards.length} thẻ từ vựng</p>
      </section>

      <div className="space-y-5">
        <SetDashboard
          summary={summary}
          onStartReview={() => openMode("learn")}
          onStartMatch={() => openMode("match")}
          onStartBlast={() => openMode("blast")}
        />
        <ModeGrid onModeChange={openMode} />
        <BulkImport set={set} onImported={addCards} />
        <CardEditor set={set} onCreated={addCard} />
        <CardManager set={set} cards={cards} onUpdated={updateCardInSet} onDeleted={deleteCardFromSet} />
      </div>
    </Shell>
  );
}
