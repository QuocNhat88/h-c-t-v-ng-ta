import { Check, Pencil, Search, Trash2, Volume2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteCard, updateCard } from "../services/api.js";
import { playTone, speak } from "../utils/audio.js";
import { displayMeaning } from "../utils/vietnamese.js";

export default function CardManager({ set, cards, onUpdated, onDeleted }) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  const filteredCards = useMemo(() => {
    const text = query.trim().toLocaleLowerCase("vi-VN");
    if (!text) return cards;
    return cards.filter((card) =>
      `${card.term} ${card.definition} ${displayMeaning(card.definition)} ${card.example || ""}`
        .toLocaleLowerCase("vi-VN")
        .includes(text)
    );
  }, [cards, query]);

  function startEdit(card) {
    setEditingId(card.id);
    setDraft({
      term: card.term,
      definition: displayMeaning(card.definition),
      example: card.example || "",
      partOfSpeech: card.partOfSpeech || ""
    });
  }

  async function save(card) {
    const updated = await updateCard(card.id, draft);
    onUpdated({ ...updated, definition: draft.definition });
    setEditingId(null);
    playTone("correct");
  }

  async function remove(card) {
    await deleteCard(card.id);
    onDeleted(card.id);
    playTone("wrong");
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black">Quản lý thẻ</h2>
          <p className="text-sm text-slate-500">Tìm kiếm, sửa nhanh và xóa thẻ trong bộ từ.</p>
        </div>
        <label className="flex w-full items-center gap-2 rounded-xl border border-line bg-cloud/50 px-3 py-3 sm:w-80">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent outline-none"
            placeholder="Tìm từ hoặc nghĩa..."
          />
        </label>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-line md:block">
        <div className="grid grid-cols-[1fr_1fr_auto] bg-cloud px-4 py-3 text-sm font-black uppercase text-slate-500">
          <span>Thuật ngữ</span>
          <span>Định nghĩa</span>
          <span>Thao tác</span>
        </div>
        <div className="divide-y divide-line">
          {filteredCards.map((card) => (
            <CardRow
              key={card.id}
              card={card}
              set={set}
              editing={editingId === card.id}
              draft={draft}
              setDraft={setDraft}
              startEdit={startEdit}
              save={save}
              remove={remove}
              cancel={() => setEditingId(null)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {filteredCards.map((card) => (
          <CardMobile
            key={card.id}
            card={card}
            set={set}
            editing={editingId === card.id}
            draft={draft}
            setDraft={setDraft}
            startEdit={startEdit}
            save={save}
            remove={remove}
            cancel={() => setEditingId(null)}
          />
        ))}
      </div>

      {!filteredCards.length && (
        <div className="rounded-xl bg-cloud/70 p-5 text-center text-sm font-semibold text-slate-500">Không tìm thấy thẻ phù hợp.</div>
      )}
    </section>
  );
}

function CardRow({ card, set, editing, draft, setDraft, startEdit, save, remove, cancel }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-4 py-3">
      {editing ? (
        <>
          <input value={draft.term} onChange={(event) => setDraft((current) => ({ ...current, term: event.target.value }))} className="rounded-lg border border-line px-3 py-2 outline-none focus:border-brand" />
          <input value={draft.definition} onChange={(event) => setDraft((current) => ({ ...current, definition: event.target.value }))} className="rounded-lg border border-line px-3 py-2 outline-none focus:border-brand" />
        </>
      ) : (
        <>
          <div className="min-w-0">
            <p className="truncate font-bold">{card.term}</p>
            {card.example && <p className="truncate text-sm text-slate-500">{card.example}</p>}
          </div>
          <p className="truncate font-semibold text-slate-700">{displayMeaning(card.definition)}</p>
        </>
      )}
      <Actions card={card} set={set} editing={editing} startEdit={startEdit} save={save} remove={remove} cancel={cancel} />
    </div>
  );
}

function CardMobile({ card, set, editing, draft, setDraft, startEdit, save, remove, cancel }) {
  return (
    <div className="rounded-xl border border-line bg-cloud/40 p-3">
      {editing ? (
        <div className="space-y-2">
          <input value={draft.term} onChange={(event) => setDraft((current) => ({ ...current, term: event.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand" />
          <input value={draft.definition} onChange={(event) => setDraft((current) => ({ ...current, definition: event.target.value }))} className="w-full rounded-lg border border-line px-3 py-2 outline-none focus:border-brand" />
        </div>
      ) : (
        <div>
          <p className="text-lg font-black">{card.term}</p>
          <p className="mt-1 font-semibold text-slate-700">{displayMeaning(card.definition)}</p>
          {card.example && <p className="mt-1 text-sm text-slate-500">{card.example}</p>}
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <Actions card={card} set={set} editing={editing} startEdit={startEdit} save={save} remove={remove} cancel={cancel} />
      </div>
    </div>
  );
}

function Actions({ card, set, editing, startEdit, save, remove, cancel }) {
  if (editing) {
    return (
      <div className="flex justify-end gap-2">
        <button onClick={() => save(card)} className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-white" title="Lưu">
          <Check size={17} />
        </button>
        <button onClick={cancel} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white" title="Hủy">
          <X size={17} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <button onClick={() => speak(card.term, set.sourceLanguage)} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-brand" title="Phát âm">
        <Volume2 size={17} />
      </button>
      <button onClick={() => startEdit(card)} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white" title="Sửa">
        <Pencil size={17} />
      </button>
      <button onClick={() => remove(card)} className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-orange-700" title="Xóa">
        <Trash2 size={17} />
      </button>
    </div>
  );
}
