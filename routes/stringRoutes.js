// routes/stringRoutes.js
import express from "express";
import {
  createString,
  getAllStrings,
  getStringByValue,
  deleteString,
  filterByNaturalLanguage,
} from "../controllers/stringController.js";
import { validateStringInput } from "../middlewares/validateStringInput.js";

const router = express.Router();

router.post("/", validateStringInput, createString);
router.get("/filter-by-natural-language", filterByNaturalLanguage);
router.get("/", getAllStrings);
router.get("/:string_value", getStringByValue);
router.delete("/:string_value", deleteString);

export default router;
