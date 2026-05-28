import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./folders.service.js";

const folderSchema = z.object({
  name: z.string().min(1)
});

export const list = asyncHandler(async (req, res) => {
  res.json(await service.listFolders());
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createFolder(folderSchema.parse(req.body)));
});

export const remove = asyncHandler(async (req, res) => {
  res.json(await service.deleteFolder(req.params.id));
});
