import { ApiError } from "../../utils/ApiError.js";
import { CardModel } from "../cards/card.model.js";
import { SetModel } from "./set.model.js";

export async function listSets() {
  const sets = await SetModel.find().sort({ updatedAt: -1 });
  const counts = await CardModel.aggregate([
    { $group: { _id: "$setId", cardCount: { $sum: 1 } } }
  ]);
  const countMap = new Map(counts.map((item) => [item._id.toString(), item.cardCount]));

  return sets.map((set) => ({
    ...set.toJSON(),
    cardCount: countMap.get(set.id) || 0
  }));
}

export async function getSet(id) {
  const set = await SetModel.findById(id);
  if (!set) throw new ApiError(404, "Set not found");

  const cards = await CardModel.find({ setId: id }).sort({ createdAt: 1 });
  return {
    ...set.toJSON(),
    cards: cards.map((card) => card.toJSON())
  };
}

export async function getSetExport(id) {
  const set = await getSet(id);
  return {
    title: set.title,
    description: set.description,
    sourceLanguage: set.sourceLanguage,
    targetLanguage: set.targetLanguage,
    exportedAt: new Date().toISOString(),
    cards: set.cards.map((card) => ({
      term: card.term,
      definition: card.definition,
      example: card.example || "",
      partOfSpeech: card.partOfSpeech || ""
    }))
  };
}

export async function createSet(payload) {
  const set = await SetModel.create(payload);
  return set.toJSON();
}

export async function updateSet(id, payload) {
  const set = await SetModel.findByIdAndUpdate(id, payload, { new: true });
  if (!set) throw new ApiError(404, "Set not found");
  return getSet(id);
}

export async function deleteSet(id) {
  const set = await SetModel.findByIdAndDelete(id);
  if (!set) throw new ApiError(404, "Set not found");
  await CardModel.deleteMany({ setId: id });
  return { id };
}

export function toCsv(exportData) {
  const escape = (value) => {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
    return text;
  };

  const rows = [
    ["term", "definition", "example", "partOfSpeech"],
    ...exportData.cards.map((card) => [card.term, card.definition, card.example, card.partOfSpeech])
  ];

  return rows.map((row) => row.map(escape).join(",")).join("\n");
}
