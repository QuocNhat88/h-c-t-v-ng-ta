import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api"
});

export async function getSets() {
  const { data } = await api.get("/sets");
  return data;
}

export async function getFolders() {
  const { data } = await api.get("/folders");
  return data;
}

export async function createFolder(payload) {
  const { data } = await api.post("/folders", payload);
  return data;
}

export async function deleteFolder(id) {
  const { data } = await api.delete(`/folders/${id}`);
  return data;
}

export async function getSet(id) {
  const { data } = await api.get(`/sets/${id}`);
  return data;
}

export function getSetExportUrl(id, format) {
  return `${api.defaults.baseURL}/sets/${id}/export.${format}`;
}

export async function createSet(payload) {
  const { data } = await api.post("/sets", payload);
  return data;
}

export async function deleteSet(id) {
  const { data } = await api.delete(`/sets/${id}`);
  return data;
}

export async function createCard(payload) {
  const { data } = await api.post("/cards", payload);
  return data;
}

export async function createCardsBulk(payload) {
  const { data } = await api.post("/cards/bulk", payload);
  return data;
}

export async function deleteCard(id) {
  const { data } = await api.delete(`/cards/${id}`);
  return data;
}

export async function updateCard(id, payload) {
  const { data } = await api.patch(`/cards/${id}`, payload);
  return data;
}

export async function suggestMeaning(term, from, to) {
  const { data } = await api.get("/dictionary/suggest", { params: { term, from, to } });
  return data;
}

export async function getStudySession(setId) {
  const { data } = await api.get(`/study/${setId}/session`);
  return data;
}

export async function getStudySummary(setId) {
  const { data } = await api.get(`/study/${setId}/summary`);
  return data;
}

export async function submitStudyAnswer(payload) {
  const { data } = await api.post("/study/answer", payload);
  return data;
}

export async function getTest(setId) {
  const { data } = await api.get(`/tests/${setId}`);
  return data;
}

export async function saveScore(payload) {
  const { data } = await api.post("/games/scores", payload);
  return data;
}
