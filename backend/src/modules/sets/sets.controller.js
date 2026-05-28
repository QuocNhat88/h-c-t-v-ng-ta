import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./sets.service.js";

const setSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  sourceLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
  folderId: z.string().optional().nullable()
});

export const list = asyncHandler(async (req, res) => {
  res.json(await service.listSets());
});

export const detail = asyncHandler(async (req, res) => {
  res.json(await service.getSet(req.params.id));
});

export const exportJson = asyncHandler(async (req, res) => {
  const data = await service.getSetExport(req.params.id);
  const filename = `${data.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-backup.json`;
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.json(data);
});

export const exportCsv = asyncHandler(async (req, res) => {
  const data = await service.getSetExport(req.params.id);
  const filename = `${data.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-cards.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(`\uFEFF${service.toCsv(data)}`);
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createSet(setSchema.parse(req.body)));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateSet(req.params.id, setSchema.partial().parse(req.body)));
});

export const remove = asyncHandler(async (req, res) => {
  res.json(await service.deleteSet(req.params.id));
});
