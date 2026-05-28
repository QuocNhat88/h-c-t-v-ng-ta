import { Check, Loader2, Plus, Sparkles, Volume2, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createCard, suggestMeaning } from "../services/api.js";
import { playTone, speak } from "../utils/audio.js";

export default function CardEditor({ set, onCreated }) {
  const [form, setForm] = useState({ term: "", definition: "", example: "", partOfSpeech: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestStatus, setSuggestStatus] = useState("idle");
  const lastAutoDefinition = useRef("");

  useEffect(() => {
    const term = form.term.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setSuggestStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggest(true);
      setSuggestStatus("loading");
      try {
        const result = await suggestMeaning(term, set.sourceLanguage, set.targetLanguage);
        const nextSuggestions = result.suggestions || [];
        setSuggestions(nextSuggestions);
        setSuggestStatus(nextSuggestions.length ? "ready" : "empty");

        if (nextSuggestions[0]) {
          setForm((current) => {
            const shouldAutoFill = !current.definition.trim() || current.definition === lastAutoDefinition.current;
            if (!shouldAutoFill) return current;
            lastAutoDefinition.current = nextSuggestions[0];
            return { ...current, definition: nextSuggestions[0] };
          });
        }
      } finally {
        setLoadingSuggest(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [form.term, set.sourceLanguage, set.targetLanguage]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.term.trim() || !form.definition.trim()) return;

    setSaving(true);
    const card = await createCard({ ...form, setId: set.id });
    playTone("correct");
    setForm({ term: "", definition: "", example: "", partOfSpeech: "" });
    lastAutoDefinition.current = "";
    setSuggestions([]);
    setSuggestStatus("idle");
    setSaving(false);
    onCreated(card);
  }

  function updateTerm(value) {
    setForm((current) => ({
      ...current,
      term: value,
      definition: current.definition === lastAutoDefinition.current ? "" : current.definition
    }));
    if (lastAutoDefinition.current) lastAutoDefinition.current = "";
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Thêm từ vựng</h2>
          <p className="text-sm leading-5 text-slate-500">Nhập từ tiếng Anh, hệ thống sẽ gợi ý nghĩa tiếng Việt.</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
          <Sparkles size={20} />
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Tiếng Anh</span>
          <div className="flex gap-2">
            <input
              value={form.term}
              onChange={(event) => updateTerm(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-line bg-cloud/40 px-3 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
              placeholder="hello"
            />
            <button
              type="button"
              onClick={() => speak(form.term, set.sourceLanguage)}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-cloud text-brand"
              title="Phát âm"
            >
              <Volume2 size={18} />
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Nghĩa tiếng Việt</span>
          <input
            value={form.definition}
            onChange={(event) => setForm((current) => ({ ...current, definition: event.target.value }))}
            className="w-full rounded-xl border border-line bg-cloud/40 px-3 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            placeholder="xin chào"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input
          value={form.example}
          onChange={(event) => setForm((current) => ({ ...current, example: event.target.value }))}
          className="rounded-xl border border-line bg-cloud/40 px-3 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
          placeholder="Example sentence"
        />
        <input
          value={form.partOfSpeech}
          onChange={(event) => setForm((current) => ({ ...current, partOfSpeech: event.target.value }))}
          className="rounded-xl border border-line bg-cloud/40 px-3 py-3 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
          placeholder="noun, verb, adjective..."
        />
      </div>

      <div className="mt-4 rounded-xl border border-line bg-cloud/50 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
          {loadingSuggest ? <Loader2 className="animate-spin text-brand" size={16} /> : <Wand2 className="text-brand" size={16} />}
          {suggestStatus === "loading" && "Đang tìm gợi ý..."}
          {suggestStatus === "ready" && "Gợi ý nghĩa"}
          {suggestStatus === "empty" && "Chưa tìm thấy gợi ý tự động"}
          {suggestStatus === "idle" && "Gợi ý sẽ hiện ở đây"}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setForm((current) => ({ ...current, definition: item }));
                lastAutoDefinition.current = item;
                playTone("tap");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1.5 text-sm font-semibold text-brand shadow-sm transition hover:-translate-y-0.5 hover:border-brand"
            >
              {form.definition === item && <Check size={14} />}
              {item}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-black text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
      >
        <Plus size={18} />
        Thêm thẻ
      </button>
    </form>
  );
}
