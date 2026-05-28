import mongoose from "mongoose";

function normalizeName(name) {
  return name.trim().toLocaleLowerCase("vi-VN");
}

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    nameKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.nameKey;
      }
    }
  }
);

folderSchema.pre("validate", function setNameKey(next) {
  if (this.isModified("name") || !this.nameKey) {
    this.nameKey = normalizeName(this.name);
  }
  next();
});

export { normalizeName };
export const FolderModel = mongoose.model("Folder", folderSchema);
