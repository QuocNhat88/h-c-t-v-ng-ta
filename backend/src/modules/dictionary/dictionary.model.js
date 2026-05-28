import mongoose from "mongoose";

const dictionaryEntrySchema = new mongoose.Schema(
  {
    term: { type: String, required: true, lowercase: true, trim: true, index: true },
    from: { type: String, default: "en-US" },
    to: { type: String, default: "vi-VN" },
    suggestions: [{ type: String, trim: true }],
    phonetic: { type: String, default: "" },
    partOfSpeech: { type: String, default: "" },
    examples: [{ type: String, trim: true }]
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

dictionaryEntrySchema.index({ term: 1, from: 1, to: 1 }, { unique: true });

export const DictionaryEntryModel = mongoose.model("DictionaryEntry", dictionaryEntrySchema);
