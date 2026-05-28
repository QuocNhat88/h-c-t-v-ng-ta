import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    setId: { type: mongoose.Schema.Types.ObjectId, ref: "Set", required: true, index: true },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true, index: true },
    status: { type: String, enum: ["new", "learning", "known", "missed"], default: "new" },
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    ease: { type: Number, default: 2.5 },
    intervalDays: { type: Number, default: 0 },
    lastReviewedAt: { type: Date },
    nextReviewAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.setId = ret.setId.toString();
        ret.cardId = ret.cardId.toString();
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

progressSchema.index({ setId: 1, cardId: 1 }, { unique: true });

export const ProgressModel = mongoose.model("Progress", progressSchema);
