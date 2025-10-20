// controllers/stringController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeString } from "../utils/analyzer.js";
import { applyFilters } from "../utils/filters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "strings.json");

// ensure data file
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");

const loadStrings = () => {
  const raw = fs.readFileSync(DATA_FILE, "utf-8") || "[]";
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveStrings = (arr) => fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), "utf-8");

// POST /strings
export const createString = (req, res, next) => {
  try {
    const { value } = req.body; // validateStringInput ensures exists and is string

    const properties = analyzeString(value);
    const id = properties.sha256_hash;

    const strings = loadStrings();

    if (strings.some((s) => s.id === id)) {
      return res.status(409).json({ error: "String already exists in the system" });
    }

    const entry = {
      id,
      value,
      properties,
      created_at: new Date().toISOString(),
    };

    strings.push(entry);
    saveStrings(strings);

    return res.status(201).json(entry);
  } catch (err) {
    return next(err);
  }
};

// GET /strings
export const getAllStrings = (req, res, next) => {
  try {
    const strings = loadStrings();
    const result = applyFilters(strings, req.query);
    return res.status(200).json(result);
  } catch (err) {
    return  res.status(400)
  }
};

// GET /strings/:string_value
export const getStringByValue = (req, res, next) => {
  try {
    const { string_value } = req.params;
    const strings = loadStrings();
    const found = strings.find((s) => s.value === string_value);
    if (!found) return res.status(404).json({ error: "String not found" });
    return res.status(200).json(found);
  } catch (err) {
    return next(err);
  }
};

// DELETE /strings/:string_value
export const deleteString = (req, res, next) => {
  try {
    const { string_value } = req.params;
    const strings = loadStrings();
    const idx = strings.findIndex((s) => s.value === string_value);
    if (idx === -1) return res.status(404).json({ error: "String not found" });
    strings.splice(idx, 1);
    saveStrings(strings);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

// GET /strings/filter-by-natural-language?query=...
export const filterByNaturalLanguage = (req, res, next) => {
  try {
    const q = req.query.query;
    if (!q || typeof q !== "string") return res.status(400).json({ error: "Missing 'query' parameter" });

    const parsed = parseNaturalLanguage(q.toLowerCase()); // returns an object like { word_count:1, is_palindrome:true, ... }

    const strings = loadStrings();
    const result = applyFilters(strings, parsed);

    return res.status(200).json({
      data: result.data,
      count: result.count,
      interpreted_query: {
        original: q,
        parsed_filters: parsed,
      },
    });
  } catch (err) {
    // If parseNaturalLanguage created typed error, let middleware handle
    return next(err);
  }
};

/* natural language heuristics */
const parseNaturalLanguage = (text) => {
  const filters = {};

  if (/\bpalindromic\b/.test(text) || /\bpalindrome\b/.test(text)) filters.is_palindrome = true;
  if (/\bsingle word\b/.test(text) || /\bone word\b/.test(text)) filters.word_count = 1;

  // "strings longer than 10 characters" => min_length = 11
  const mLonger = text.match(/longer than (\d+)/);
  if (mLonger) filters.min_length = parseInt(mLonger[1], 10) + 1;

  // "strings longer than or equal to 10" or "at least 10" => min_length = 10
  const mLongerEq = text.match(/longer than or equal to (\d+)|at least (\d+)/);
  if (mLongerEq) {
    const n = parseInt(mLongerEq[1] || mLongerEq[2], 10);
    if (!Number.isNaN(n)) filters.min_length = n;
  }

  // "shorter than 10 characters" => max_length = 9
  const mShorter = text.match(/shorter than (\d+)/);
  if (mShorter) filters.max_length = parseInt(mShorter[1], 10) - 1;

  // containing the letter x OR containing x
  const mContains = text.match(/containing the letter (\w)/) || text.match(/containing (\w)/);
  if (mContains) filters.contains_character = mContains[1];

  if (Object.keys(filters).length === 0) {
    const err = new Error("Unable to parse natural language query");
    err.statusCode = 400;
    throw err;
  }

  // Validate: conflicting filters example (min>max)
  if (filters.min_length !== undefined && filters.max_length !== undefined) {
    if (filters.min_length > filters.max_length) {
      const err = new Error("Parsed filters conflict (min_length > max_length)");
      err.statusCode = 422;
      throw err;
    }
  }

  return filters;
};
