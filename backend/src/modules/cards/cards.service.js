import { ApiError } from "../../utils/ApiError.js";
import { ProgressModel } from "../study/progress.model.js";
import { SetModel } from "../sets/set.model.js";
import { CardModel } from "./card.model.js";

export async function createCard(payload) {
  const set = await SetModel.findById(payload.setId);
  if (!set) throw new ApiError(404, "Set not found");

  const card = await CardModel.create(payload);
  return card.toJSON();
}

export async function createCardsBulk(setId, cards) {
  const set = await SetModel.findById(setId);
  if (!set) throw new ApiError(404, "Set not found");

  const cleanCards = cards
    .map((card) => ({
      setId,
      term: card.term?.trim(),
      definition: card.definition?.trim(),
      example: card.example?.trim() || "",
      partOfSpeech: card.partOfSpeech?.trim() || ""
    }))
    .filter((card) => card.term && card.definition);

  if (!cleanCards.length) throw new ApiError(400, "No valid cards to import");

  const created = await CardModel.insertMany(cleanCards, { ordered: false });
  return created.map((card) => card.toJSON());
}

export async function updateCard(id, payload) {
  const card = await CardModel.findByIdAndUpdate(id, payload, { new: true });
  if (!card) throw new ApiError(404, "Card not found");
  return card.toJSON();
}

export async function deleteCard(id) {
  const card = await CardModel.findByIdAndDelete(id);
  if (!card) throw new ApiError(404, "Card not found");
  await ProgressModel.deleteMany({ cardId: id });
  return { id };
}
