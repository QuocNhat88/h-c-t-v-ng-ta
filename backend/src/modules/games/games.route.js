import { Router } from "express";
import * as controller from "./games.controller.js";

const router = Router();

router.get("/scores", controller.scores);
router.post("/scores", controller.createScore);

export default router;
