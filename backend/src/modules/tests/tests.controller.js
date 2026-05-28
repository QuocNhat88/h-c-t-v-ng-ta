import { asyncHandler } from "../../utils/asyncHandler.js";
import * as service from "./tests.service.js";

export const generate = asyncHandler(async (req, res) => {
  res.json(await service.generateTest(req.params.setId));
});
