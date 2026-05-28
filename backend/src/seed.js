import { connectDatabase } from "./config/database.js";
import { CardModel } from "./modules/cards/card.model.js";
import { SetModel } from "./modules/sets/set.model.js";

const cards = [
  ["hello", "xin chao", "Hello, how are you?", "interjection"],
  ["thank you", "cam on", "Thank you for your help.", "phrase"],
  ["book", "quyen sach", "This book is useful.", "noun"],
  ["study", "hoc tap", "I study vocabulary every day.", "verb"],
  ["friend", "nguoi ban", "She is my best friend.", "noun"],
  ["school", "truong hoc", "My school is near my house.", "noun"]
];

await connectDatabase();

const existing = await SetModel.findOne({ title: "English Starter" });
if (existing) {
  console.log("Seed data already exists");
  process.exit(0);
}

const set = await SetModel.create({
  title: "English Starter",
  description: "Bo tu tieng Anh co ban de bat dau hoc.",
  sourceLanguage: "en-US",
  targetLanguage: "vi-VN"
});

await CardModel.insertMany(
  cards.map(([term, definition, example, partOfSpeech]) => ({
    setId: set._id,
    term,
    definition,
    example,
    partOfSpeech
  }))
);

console.log("Seed data created");
process.exit(0);
