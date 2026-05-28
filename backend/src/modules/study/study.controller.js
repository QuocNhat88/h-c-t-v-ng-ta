import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./study.service.js";

const answerSchema = z.object({
  setId: z.string().min(1),
  cardId: z.string().min(1),
  isCorrect: z.boolean()
});

export const session = asyncHandler(async (req, res) => {
  res.json(await service.getSession(req.params.setId));
});

export const summary = asyncHandler(async (req, res) => {
  res.json(await service.getSummary(req.params.setId));
});

export const answer = asyncHandler(async (req, res) => {
  res.json(await service.submitAnswer(answerSchema.parse(req.body)));
});
