import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./games.service.js";

const scoreSchema = z.object({
  setId: z.string().min(1),
  mode: z.enum(["match", "blast", "blocks"]),
  score: z.number(),
  durationMs: z.number().optional(),
  mistakes: z.number().optional()
});

export const createScore = asyncHandler(async (req, res) => {
  res.status(201).json(await service.saveScore(scoreSchema.parse(req.body)));
});

export const scores = asyncHandler(async (req, res) => {
  res.json(await service.listScores(req.query.setId));
});
