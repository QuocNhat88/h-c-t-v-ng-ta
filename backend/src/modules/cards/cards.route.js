import { Router } from "express";
import * as controller from "./cards.controller.js";

const router = Router();

router.post("/", controller.create);
router.post("/bulk", controller.bulkCreate);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
