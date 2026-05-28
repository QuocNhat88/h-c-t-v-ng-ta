import { Router } from "express";
import * as controller from "./tests.controller.js";

const router = Router();

router.get("/:setId", controller.generate);

export default router;
