import { ScoreModel } from "./score.model.js";

export async function saveScore(payload) {
  const score = await ScoreModel.create(payload);
  return score.toJSON();
}

export async function listScores(setId) {
  const query = setId ? { setId } : {};
  const scores = await ScoreModel.find(query).sort({ score: -1, durationMs: 1 }).limit(20);
  return scores.map((score) => score.toJSON());
}
