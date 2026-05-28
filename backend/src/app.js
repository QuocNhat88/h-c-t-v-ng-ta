import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import setRoutes from "./modules/sets/sets.route.js";
import cardRoutes from "./modules/cards/cards.route.js";
import dictionaryRoutes from "./modules/dictionary/dictionary.route.js";
import studyRoutes from "./modules/study/study.route.js";
import testRoutes from "./modules/tests/tests.route.js";
import gameRoutes from "./modules/games/games.route.js";

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/sets", setRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/dictionary", dictionaryRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/games", gameRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
