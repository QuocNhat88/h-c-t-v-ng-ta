import { Router } from "express";
import * as controller from "./study.controller.js";

const router = Router();

router.get("/:setId/session", controller.session);
router.get("/:setId/summary", controller.summary);
router.post("/answer", controller.answer);

export default router;
