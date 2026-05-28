import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    setId: { type: mongoose.Schema.Types.ObjectId, ref: "Set", required: true, index: true },
    mode: { type: String, enum: ["match", "blast", "blocks"], required: true },
    score: { type: Number, required: true },
    durationMs: { type: Number, default: 0 },
    mistakes: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.setId = ret.setId.toString();
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

export const ScoreModel = mongoose.model("Score", scoreSchema);
