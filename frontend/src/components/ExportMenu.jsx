import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { getSetExportUrl } from "../services/api.js";

export default function ExportMenu({ set }) {
  const [open, setOpen] = useState(false);

  function download(format) {
    window.location.href = getSetExportUrl(set.id, format);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white font-semibold sm:inline-flex sm:w-auto sm:gap-2 sm:px-4"
        title="Export"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Export</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-20 w-64 rounded-2xl border border-line bg-white p-2 shadow-soft">
          <button onClick={() => download("csv")} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-cloud">
            <FileSpreadsheet size={17} />
            CSV để import lại
          </button>
          <button onClick={() => download("json")} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold hover:bg-cloud">
            <FileJson size={17} />
            JSON backup đầy đủ
          </button>
        </div>
      )}
    </div>
  );
}
