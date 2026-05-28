import { BookOpenCheck, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/layout/Shell.jsx";
import { createSet, getSets } from "../services/api.js";

export default function Home() {
  const [sets, setSets] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    getSets().then(setSets);
  }, []);

  async function addSet(event) {
    event.preventDefault();
    if (!title.trim()) return;
    const set = await createSet({
      title,
      description: "Bộ từ vựng mới",
      sourceLanguage: "en-US",
      targetLanguage: "vi-VN"
    });
    setSets((current) => [set, ...current]);
    setTitle("");
  }

  const action = (
    <form onSubmit={addSet} className="flex max-w-[52vw] gap-2 sm:max-w-sm">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="min-w-0 rounded-xl border border-line bg-cloud/60 px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 sm:text-base"
        placeholder="Tên bộ từ"
      />
      <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-soft" title="Tạo bộ từ">
        <Plus size={18} />
      </button>
    </form>
  );

  return (
    <Shell action={action}>
      <section className="mb-6 rounded-2xl border border-line bg-white/80 p-5 shadow-soft sm:p-7">
        <div className="flex items-start gap-4">
          <div className="hidden h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand sm:grid">
            <BookOpenCheck size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Thư viện học tập</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
              Tạo bộ từ, nghe phát âm, học bằng flashcard, kiểm tra và chơi game ngắn để giữ nhịp học mỗi ngày.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => (
          <Link
            to={`/sets/${set.id}`}
            key={set.id}
            className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xl font-black">{set.title}</p>
                <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{set.description}</p>
              </div>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-black text-brand">{set.cardCount || 0}</span>
            </div>
            <p className="mt-5 text-sm font-black text-brand transition group-hover:translate-x-1">Vào học</p>
          </Link>
        ))}
      </section>
    </Shell>
  );
}
