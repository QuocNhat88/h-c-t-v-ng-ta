import { BookMarked, Boxes, FileQuestion, Layers, Rocket, SquareStack } from "lucide-react";

const modes = [
  { id: "flashcards", label: "Thẻ ghi nhớ", icon: Layers, tone: "bg-brand" },
  { id: "learn", label: "Học", icon: Rocket, tone: "bg-brand" },
  { id: "test", label: "Kiểm tra", icon: BookMarked, tone: "bg-brand" },
  { id: "blocks", label: "Khối hộp", icon: Boxes, tone: "bg-cyan" },
  { id: "blast", label: "Blast", icon: FileQuestion, tone: "bg-cyan" },
  { id: "match", label: "Ghép thẻ", icon: SquareStack, tone: "bg-cyan" }
];

export default function ModeGrid({ activeMode, onModeChange }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const active = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`group flex min-h-[82px] items-center justify-center gap-3 rounded-2xl border bg-white px-3 text-center text-sm font-black shadow-sm transition duration-200 active:scale-[0.98] sm:min-h-[92px] sm:gap-4 sm:text-lg ${
              active ? "border-brand bg-brand/[0.04] ring-4 ring-brand/10" : "border-line hover:-translate-y-1 hover:shadow-soft"
            }`}
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${mode.tone} text-white shadow-sm transition group-hover:scale-105 sm:h-11 sm:w-11`}>
              <Icon size={22} />
            </span>
            <span className="leading-tight">{mode.label}</span>
          </button>
        );
      })}
    </section>
  );
}
