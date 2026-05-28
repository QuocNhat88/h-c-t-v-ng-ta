import mongoose from "mongoose";

const setSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    sourceLanguage: {
      type: String,
      default: "en-US"
    },
    targetLanguage: {
      type: String,
      default: "vi-VN"
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

export const SetModel = mongoose.model("Set", setSchema);
