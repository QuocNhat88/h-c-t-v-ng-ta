import { Router } from "express";
import * as controller from "./sets.controller.js";

const router = Router();

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id/export.json", controller.exportJson);
router.get("/:id/export.csv", controller.exportCsv);
router.get("/:id", controller.detail);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
