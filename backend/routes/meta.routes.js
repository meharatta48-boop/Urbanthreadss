import express from "express";
import { trackMetaEvent } from "../controllers/meta.controller.js";

const router = express.Router();

router.post("/events", trackMetaEvent);

export default router;
