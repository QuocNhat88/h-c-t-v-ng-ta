import { ApiError } from "../../utils/ApiError.js";
import { CardModel } from "../cards/card.model.js";
import { ScoreModel } from "../games/score.model.js";
import { ProgressModel } from "../study/progress.model.js";
import { SetModel } from "../sets/set.model.js";
import { FolderModel, normalizeName } from "./folder.model.js";

const defaultFolders = {
  test: "Test",
  toeic: "Tự học TOEIC"
};

async function findOrCreateFolder(name) {
  const nameKey = normalizeName(name);
  return FolderModel.findOneAndUpdate(
    { nameKey },
    { $setOnInsert: { name, nameKey } },
    { new: true, upsert: true }
  );
}

export async function ensureDefaultLibraryFolders() {
  const unfiledSets = await SetModel.find({ $or: [{ folderId: null }, { folderId: { $exists: false } }] });
  if (!unfiledSets.length) return;

  const [testFolder, toeicFolder] = await Promise.all([
    findOrCreateFolder(defaultFolders.test),
    findOrCreateFolder(defaultFolders.toeic)
  ]);

  await Promise.all(
    unfiledSets.map((set) => {
      const targetFolder = /^test/i.test(set.title.trim()) ? testFolder : toeicFolder;
      return SetModel.findByIdAndUpdate(set.id, { folderId: targetFolder.id });
    })
  );
}

export async function listFolders() {
  await ensureDefaultLibraryFolders();

  const folders = await FolderModel.find().sort({ updatedAt: -1 });
  const counts = await SetModel.aggregate([
    { $match: { folderId: { $ne: null } } },
    { $group: { _id: "$folderId", setCount: { $sum: 1 } } }
  ]);
  const countMap = new Map(counts.map((item) => [item._id.toString(), item.setCount]));

  return folders.map((folder) => ({
    ...folder.toJSON(),
    setCount: countMap.get(folder.id) || 0
  }));
}

export async function createFolder(payload) {
  const name = payload.name.trim();
  const folder = await findOrCreateFolder(name);
  return {
    ...folder.toJSON(),
    setCount: await SetModel.countDocuments({ folderId: folder.id })
  };
}

export async function deleteFolder(id) {
  const folder = await FolderModel.findByIdAndDelete(id);
  if (!folder) throw new ApiError(404, "Folder not found");

  const sets = await SetModel.find({ folderId: id }).select("_id");
  const setIds = sets.map((set) => set._id);

  if (setIds.length) {
    await Promise.all([
      CardModel.deleteMany({ setId: { $in: setIds } }),
      ProgressModel.deleteMany({ setId: { $in: setIds } }),
      ScoreModel.deleteMany({ setId: { $in: setIds } }),
      SetModel.deleteMany({ _id: { $in: setIds } })
    ]);
  }

  return { id };
}
