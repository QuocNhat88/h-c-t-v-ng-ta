const KEY = "cloneql.habits.v1";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function getHabits() {
  const fallback = {
    goal: 12,
    streak: 0,
    lastStudyDate: "",
    daily: {},
    bestMatchMs: null,
    bestBlastScore: 0
  };

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return fallback;
  }
}

export function getTodayStats() {
  const habits = getHabits();
  return {
    ...habits,
    todayKey: todayKey(),
    studied: habits.daily?.[todayKey()]?.studied || 0,
    xp: habits.daily?.[todayKey()]?.xp || 0
  };
}

export function recordStudy(amount = 1, xp = 10) {
  const habits = getHabits();
  const today = todayKey();
  const previous = habits.daily?.[today] || { studied: 0, xp: 0 };
  const streak =
    habits.lastStudyDate === today
      ? habits.streak || 1
      : habits.lastStudyDate === yesterdayKey()
        ? (habits.streak || 0) + 1
        : 1;

  const next = {
    ...habits,
    streak,
    lastStudyDate: today,
    daily: {
      ...habits.daily,
      [today]: {
        studied: previous.studied + amount,
        xp: previous.xp + xp
      }
    }
  };

  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("cloneql:habits"));
  return next;
}

export function saveBestMatch(durationMs) {
  const habits = getHabits();
  if (habits.bestMatchMs && habits.bestMatchMs <= durationMs) return habits;
  const next = { ...habits, bestMatchMs: durationMs };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("cloneql:habits"));
  return next;
}

export function saveBestBlast(score) {
  const habits = getHabits();
  if ((habits.bestBlastScore || 0) >= score) return habits;
  const next = { ...habits, bestBlastScore: score };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("cloneql:habits"));
  return next;
}

export function formatDuration(ms) {
  if (!ms) return "--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
