
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { analyzeString } from "../utils/analyzer.js";
import { applyFilters } from "../utils/filters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "strings.json");


if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");


const loadStrings = () => {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    
    return [];
  }
};

const saveStrings = (arr) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), "utf-8");
};


export const createString = (req, res, next) => {
  try {
    const { value } = req.body;

    const properties = analyzeString(value);

    const id = properties.sha256_hash;

    const strings = loadStrings();

    if (strings.some((s) => s.id === id)) {
      // Duplicate -> 409 Conflict
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

    // Successful creation -> 201
    return res.status(201).json(entry);
  } catch (err) {
    // If thrown typed error with statusCode, use it
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
    return next(err);
  }
};

// GET /strings/:string_value
export const getStringByValue = (req, res, next) => {
  try {
    const { string_value } = req.params;
    const strings = loadStrings();
    const found = strings.find((s) => s.value === string_value);
    if (!found) {
      return res.status(404).json({ error: "String not found" });
    }
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
    if (idx === -1) {
      return res.status(404).json({ error: "String not found" });
    }
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
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Missing 'query' parameter" });
    }

    const parsed = parseNaturalLanguage(q.toLowerCase());
    // applyFilters expects query-like object; pass parsed
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
    return next(err);
  }
};


const parseNaturalLanguage = (text) => {
  const filters = {};

  // palindrome keywords
  if (/\bpalindromic\b/.test(text) || /\bpalindrome\b/.test(text)) {
    filters.is_palindrome = true;
  }

  // single word / one word
  if (/\bsingle word\b/.test(text) || /\bone word\b/.test(text)) {
    filters.word_count = 1;
  }

  // longer than N -> min_length = N + 1
  const longer = text.match(/longer than (\d+)/);
  if (longer) {
    const n = parseInt(longer[1], 10);
    if (!Number.isNaN(n)) filters.min_length = n + 1;
  }

  // longer than or equal to N -> min_length = N
  const longerEq = text.match(/at least (\d+)|longer than or equal to (\d+)/);
  if (longerEq) {
    const n = parseInt((longerEq[1] || longerEq[2]), 10);
    if (!Number.isNaN(n)) filters.min_length = n;
  }

  // shorter than N -> max_length = N - 1
  const shorter = text.match(/shorter than (\d+)/);
  if (shorter) {
    const n = parseInt(shorter[1], 10);
    if (!Number.isNaN(n)) filters.max_length = n - 1;
  }

  // Strings containing "letter x" or "containing the letter x" or "containing x"
  const containsLetter = text.match(/containing the letter (\w)/) || text.match(/containing (\w)/);
  if (containsLetter) {
    filters.contains_character = containsLetter[1];
  }

  // If we couldn't parse anything, throw 400
  if (Object.keys(filters).length === 0) {
    const err = new Error("Unable to parse natural language query");
    err.statusCode = 400;
    throw err;
  }

  return filters;
};
