import { Router } from "express";
import { getByArea, getByCountry, getAlgeria, getQuota } from "../controllers/fires.controller.js";

const router = Router();

router.get("/area", getByArea);
router.get("/country", getByCountry);
router.get("/algeria", getAlgeria);
router.get("/quota", getQuota);

export default router;