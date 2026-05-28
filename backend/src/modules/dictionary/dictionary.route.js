import { Router } from "express";
import * as controller from "./dictionary.controller.js";

const router = Router();

router.get("/suggest", controller.suggest);

export default router;
