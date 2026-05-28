import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    setId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Set",
      required: true,
      index: true
    },
    term: {
      type: String,
      required: true,
      trim: true
    },
    definition: {
      type: String,
      required: true,
      trim: true
    },
    example: {
      type: String,
      default: "",
      trim: true
    },
    partOfSpeech: {
      type: String,
      default: "",
      trim: true
    },
    mastered: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.setId = ret.setId.toString();
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

export const CardModel = mongoose.model("Card", cardSchema);
