import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./cards.service.js";

const cardSchema = z.object({
  setId: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
  example: z.string().optional(),
  partOfSpeech: z.string().optional()
});

const bulkSchema = z.object({
  setId: z.string().min(1),
  cards: z.array(
    z.object({
      term: z.string().min(1),
      definition: z.string().min(1),
      example: z.string().optional(),
      partOfSpeech: z.string().optional()
    })
  ).min(1).max(500)
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await service.createCard(cardSchema.parse(req.body)));
});

export const bulkCreate = asyncHandler(async (req, res) => {
  const payload = bulkSchema.parse(req.body);
  res.status(201).json(await service.createCardsBulk(payload.setId, payload.cards));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await service.updateCard(req.params.id, cardSchema.partial().parse(req.body)));
});

export const remove = asyncHandler(async (req, res) => {
  res.json(await service.deleteCard(req.params.id));
});
