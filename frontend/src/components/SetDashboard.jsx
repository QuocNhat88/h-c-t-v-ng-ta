import { BarChart3, BookOpenCheck, CalendarClock, Flame, Gamepad2, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDuration, getTodayStats } from "../utils/habits.js";
import { displayMeaning } from "../utils/vietnamese.js";

export default function SetDashboard({ summary, onStartReview, onStartMatch, onStartBlast }) {
  const [habits, setHabits] = useState(getTodayStats());

  useEffect(() => {
    function refresh() {
      setHabits(getTodayStats());
    }

    window.addEventListener("cloneql:habits", refresh);
    return () => window.removeEventListener("cloneql:habits", refresh);
  }, []);

  if (!summary) {
    return (
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl border border-line bg-white" />
        ))}
      </section>
    );
  }

  const completion = summary.total ? Math.round((summary.mastered / summary.total) * 100) : 0;
  const dailyPercent = Math.min(100, Math.round((habits.studied / habits.goal) * 100));
  const dailyDone = habits.studied >= habits.goal;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={BookOpenCheck} label="Đã học" value={`${summary.learned}/${summary.total}`} />
        <Metric icon={CalendarClock} label="Cần ôn" value={summary.due} tone="text-orange-700" />
        <Metric icon={Target} label="Đã thuộc" value={summary.mastered} tone="text-emerald-700" />
        <Metric icon={Flame} label="Streak" value={`${habits.streak || 0} ngày`} tone="text-amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Nhiệm vụ hôm nay</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">Học ngắn, đều, có thưởng. Mục tiêu là không bị quá tải.</p>
            </div>
            <Trophy className={dailyDone ? "text-amber" : "text-brand"} size={26} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <QuestStat label="Mục tiêu" value={`${habits.studied}/${habits.goal} thẻ`} />
            <QuestStat label="XP hôm nay" value={habits.xp} />
            <QuestStat label="Hoàn thành bộ" value={`${completion}%`} />
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-cloud">
            <div className={`h-full rounded-full transition-all ${dailyDone ? "bg-emerald-600" : "bg-brand"}`} style={{ width: `${dailyPercent}%` }} />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold leading-5 text-slate-600">
              {dailyDone ? "Xong mục tiêu hôm nay. Nếu còn hứng, chơi một game ngắn để củng cố." : `Còn ${Math.max(0, habits.goal - habits.studied)} thẻ là xong nhiệm vụ hôm nay.`}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button onClick={onStartReview} className="rounded-xl bg-brand px-4 py-3 font-bold text-white shadow-soft">
                Học 5 phút
              </button>
              <button onClick={onStartMatch} className="rounded-xl border border-line bg-white px-4 py-3 font-bold">
                Game nhanh
              </button>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Kỷ lục cá nhân</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">Giữ app vui bằng các mục tiêu nhỏ có thể phá được.</p>
            </div>
            <Gamepad2 className="text-cyan" size={25} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuestStat label="Match tốt nhất" value={formatDuration(habits.bestMatchMs)} />
            <QuestStat label="Blast cao nhất" value={habits.bestBlastScore || 0} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={onStartMatch} className="rounded-xl bg-cyan px-4 py-3 font-bold text-white">
              Ghép thẻ
            </button>
            <button onClick={onStartBlast} className="rounded-xl bg-ink px-4 py-3 font-bold text-white">
              Blast
            </button>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Kế hoạch học</h2>
              <p className="text-sm text-slate-500">Ưu tiên từ chưa học và từ đến hạn ôn.</p>
            </div>
            <BarChart3 className="text-brand" size={24} />
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-cloud">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            {summary.due > 0 ? `Có ${summary.due} thẻ nên ôn lại.` : "Không có thẻ đến hạn, có thể học thêm từ mới."}
          </p>
        </Panel>

        <Panel>
          <h2 className="text-xl font-black">Từ cần chú ý</h2>
          <div className="mt-3 space-y-2">
            {summary.weakCards.length ? (
              summary.weakCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between gap-3 rounded-xl bg-cloud/70 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{card.term}</p>
                    <p className="truncate text-sm text-slate-500">{displayMeaning(card.definition)}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-orange-700">
                    {card.accuracy}%
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-cloud/70 p-3 text-sm font-semibold text-slate-500">
                Chưa có dữ liệu sai. Học vài lượt để hệ thống nhận diện từ yếu.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Panel({ children }) {
  return <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">{children}</div>;
}

function Metric({ icon: Icon, label, value, tone = "text-brand" }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase text-slate-500 sm:text-sm">{label}</p>
        <Icon className={tone} size={21} />
      </div>
      <p className={`mt-3 text-2xl font-black sm:text-3xl ${tone}`}>{value}</p>
    </div>
  );
}

function QuestStat({ label, value }) {
  return (
    <div className="rounded-xl bg-cloud/70 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-ink sm:text-xl">{value}</p>
    </div>
  );
}
