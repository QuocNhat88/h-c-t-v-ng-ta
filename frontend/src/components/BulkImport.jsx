import { ClipboardList, FileUp, Loader2, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createCardsBulk } from "../services/api.js";
import { playTone } from "../utils/audio.js";

const sampleText = `hello,xin chào
book,quyển sách,This book is useful,noun
study,học tập,I study vocabulary every day,verb`;

function parseLine(line) {
  const parts = line
    .split(/,|\t/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    term: parts[0] || "",
    definition: parts[1] || "",
    example: parts[2] || "",
    partOfSpeech: parts[3] || ""
  };
}

function parseText(text) {
  return text
    .split(/\r?\n/)
    .map((line, index) => ({ index: index + 1, raw: line, ...parseLine(line) }))
    .filter((row) => row.raw.trim())
    .filter((row) => {
      const term = row.term.toLocaleLowerCase("en-US");
      const definition = row.definition.toLocaleLowerCase("en-US");
      return !(term === "term" && ["definition", "meaning"].includes(definition));
    })
    .map((row) => ({
      ...row,
      valid: Boolean(row.term && row.definition)
    }));
}

export default function BulkImport({ set, onImported }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const rows = useMemo(() => parseText(text), [text]);
  const validRows = rows.filter((row) => row.valid);
  const invalidRows = rows.filter((row) => !row.valid);

  async function importRows() {
    if (!validRows.length) return;
    setImporting(true);
    try {
      const created = await createCardsBulk({
        setId: set.id,
        cards: validRows.map(({ term, definition, example, partOfSpeech }) => ({
          term,
          definition,
          example,
          partOfSpeech
        }))
      });
      onImported(created);
      setText("");
      setOpen(false);
      playTone("correct");
    } finally {
      setImporting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 py-4 font-black shadow-sm transition active:scale-[0.98] sm:w-auto sm:justify-start sm:py-3"
      >
        <FileUp size={18} />
        Import hàng loạt
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black">
            <ClipboardList className="text-brand" size={22} />
            Import hàng loạt
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Dán mỗi dòng một thẻ: thuật ngữ, nghĩa, ví dụ, loại từ. Có thể dùng dấu phẩy hoặc tab.
          </p>
        </div>
        <button onClick={() => setOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line">
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-64 w-full resize-y rounded-xl border border-line bg-cloud/40 p-4 font-mono text-sm outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            placeholder={sampleText}
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setText(sampleText)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-3 text-sm font-bold"
            >
              <Sparkles size={16} />
              Dùng mẫu
            </button>
            <span className="text-sm font-semibold text-slate-500">
              Hợp lệ: {validRows.length} dòng
              {invalidRows.length > 0 ? `, lỗi: ${invalidRows.length} dòng` : ""}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-line">
          <div className="bg-cloud px-4 py-3 text-sm font-black uppercase text-slate-500">Preview</div>
          <div className="max-h-80 divide-y divide-line overflow-auto">
            {rows.length ? (
              rows.slice(0, 80).map((row) => (
                <div key={`${row.index}-${row.raw}`} className={`grid grid-cols-[auto_1fr] gap-3 px-4 py-3 ${row.valid ? "bg-white" : "bg-orange-50"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${row.valid ? "bg-brand/10 text-brand" : "bg-orange-100 text-orange-700"}`}>
                    {row.index}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{row.term || "Thiếu thuật ngữ"}</p>
                    <p className="truncate text-sm text-slate-600">{row.definition || "Thiếu nghĩa"}</p>
                    {(row.example || row.partOfSpeech) && (
                      <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                        {[row.example, row.partOfSpeech].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm font-semibold text-slate-500">Preview sẽ hiện sau khi bạn dán dữ liệu.</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={importRows}
        disabled={!validRows.length || importing}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-black text-white shadow-soft disabled:opacity-50 sm:w-auto"
      >
        {importing ? <Loader2 className="animate-spin" size={18} /> : <FileUp size={18} />}
        Tạo {validRows.length} thẻ
      </button>
    </section>
  );
}
