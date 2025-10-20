import express from "express";
import {
  createString,
  getStringByValue,
  getAllStrings,
  deleteString,
  filterByNaturalLanguage,
} from "../controllers/stringController.js";
import { validateStringInput } from "../middlewares/validateStringInput.js";

const router = express.Router();

// Routes
router.post("/", validateStringInput, createString);
router.get("/", getAllStrings);
router.get("/filter-by-natural-language", filterByNaturalLanguage);
router.get("/:string_value", getStringByValue);
router.delete("/:string_value", deleteString);

export default router;
