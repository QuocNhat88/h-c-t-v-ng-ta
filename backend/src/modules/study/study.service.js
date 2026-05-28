import { CardModel } from "../cards/card.model.js";
import { ProgressModel } from "./progress.model.js";

export async function getSession(setId) {
  const cards = await CardModel.find({ setId });
  const progress = await ProgressModel.find({ setId });
  const progressMap = new Map(progress.map((item) => [item.cardId.toString(), item.toJSON()]));
  const now = Date.now();

  return cards
    .map((card) => {
      const item = progressMap.get(card.id) || null;
      const nextReviewAt = item?.nextReviewAt ? new Date(item.nextReviewAt).getTime() : 0;
      const dueScore = nextReviewAt <= now ? 0 : 1;
      return {
        ...card.toJSON(),
        progress: item,
        due: nextReviewAt <= now,
        priority: dueScore * 100 + (item?.correct || 0) + (item?.streak || 0)
      };
    })
    .sort((a, b) => {
      return a.priority - b.priority;
    });
}

export async function getSummary(setId) {
  const cards = await CardModel.find({ setId });
  const progress = await ProgressModel.find({ setId });
  const progressMap = new Map(progress.map((item) => [item.cardId.toString(), item.toJSON()]));
  const now = Date.now();

  const items = cards.map((card) => {
    const item = progressMap.get(card.id) || null;
    const attempts = item?.attempts || 0;
    const correct = item?.correct || 0;
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
    const nextReviewAt = item?.nextReviewAt ? new Date(item.nextReviewAt).getTime() : 0;

    return {
      ...card.toJSON(),
      displayStatus: item?.status || "new",
      attempts,
      correct,
      accuracy,
      due: !item || nextReviewAt <= now,
      nextReviewAt: item?.nextReviewAt || null
    };
  });

  const learned = items.filter((item) => item.attempts > 0).length;
  const due = items.filter((item) => item.due).length;
  const mastered = items.filter((item) => item.displayStatus === "known").length;
  const weakCards = items
    .filter((item) => item.attempts > 0 && item.displayStatus !== "known")
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, 6);

  return {
    total: cards.length,
    learned,
    due,
    mastered,
    newCards: cards.length - learned,
    weakCards,
    cards: items
  };
}

export async function submitAnswer({ setId, cardId, isCorrect }) {
  const current = await ProgressModel.findOne({ setId, cardId });
  const attempts = (current?.attempts || 0) + 1;
  const correct = (current?.correct || 0) + (isCorrect ? 1 : 0);
  const streak = isCorrect ? (current?.streak || 0) + 1 : 0;
  const ease = Math.max(1.3, (current?.ease || 2.5) + (isCorrect ? 0.12 : -0.25));
  const intervalDays = isCorrect
    ? Math.max(1, Math.round(((current?.intervalDays || 0) || 1) * ease))
    : 0;
  const nextReviewAt = new Date(Date.now() + (isCorrect ? intervalDays * 86400000 : 10 * 60 * 1000));
  const status = isCorrect ? (streak >= 3 ? "known" : "learning") : "missed";

  const progress = await ProgressModel.findOneAndUpdate(
    { setId, cardId },
    {
      $set: {
        status,
        attempts,
        correct,
        streak,
        ease,
        intervalDays,
        lastReviewedAt: new Date(),
        nextReviewAt
      }
    },
    { new: true, upsert: true }
  );

  await CardModel.findByIdAndUpdate(cardId, { mastered: isCorrect });
  return progress.toJSON();
}
