import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./dictionary.service.js";

const querySchema = z.object({
  term: z.string().default(""),
  from: z.string().optional(),
  to: z.string().optional()
});

export const suggest = asyncHandler(async (req, res) => {
  res.json(await service.suggest(querySchema.parse(req.query)));
});
