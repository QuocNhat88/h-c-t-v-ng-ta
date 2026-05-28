import { BookOpen } from "lucide-react";

export default function Shell({ children, action }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(66,85,255,0.10),transparent_34rem),linear-gradient(180deg,#f8fbff_0%,#f3f6fb_100%)]">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-soft">
              <BookOpen size={23} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-tight">CloneQL</p>
              <p className="truncate text-xs font-semibold text-slate-500">Vocabulary studio</p>
            </div>
          </div>
          <div className="shrink-0">{action}</div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-5 sm:py-7">{children}</main>
    </div>
  );
}
