import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeString } from "../utils/analyzer.js";
import { applyFilters } from "../utils/filters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data/strings.json");


const loadStrings = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return data ? JSON.parse(data) : [];
};


const saveStrings = (strings) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(strings, null, 2), "utf-8");
};


export const createString = (req, res, next) => {
  try {
    const { value } = req.body;

    if (!value) {
      const err = new Error("Missing 'value' field in request body");
      err.statusCode = 400;
      throw err;
    }

    if (typeof value !== "string") {
      const err = new Error("'value' must be of type string");
      err.statusCode = 422;
      throw err;
    }

    const strings = loadStrings();

    // Generate SHA-256 hash
    const sha256_hash = crypto
      .createHash("sha256")
      .update(value)
      .digest("hex");

    // Check for duplicates
    if (strings.find((s) => s.id === sha256_hash)) {
      const err = new Error("String already exists in the system");
      err.statusCode = 409;
      throw err;
    }

    // Analyze string properties
    const properties = analyzeString(value);

    const newEntry = {
      id: sha256_hash,
      value,
      properties,
      created_at: new Date().toISOString(),
    };

    strings.push(newEntry);
    saveStrings(strings);

    res.status(201).json(newEntry);
  } catch (error) {
    next(error);
  }
};


export const getAllStrings = (req, res, next) => {
  try {
    const strings = loadStrings();
    const result = applyFilters(strings, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const getStringByValue = (req, res, next) => {
  try {
    const { string_value } = req.params;
    const strings = loadStrings();

    const found = strings.find((item) => item.value === string_value);
    if (!found) {
      const err = new Error("String not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json(found);
  } catch (error) {
    next(error);
  }
};


export const deleteString = (req, res, next) => {
  try {
    const { string_value } = req.params;
    const strings = loadStrings();

    const index = strings.findIndex((item) => item.value === string_value);
    if (index === -1) {
      const err = new Error("String not found");
      err.statusCode = 404;
      throw err;
    }

    strings.splice(index, 1);
    saveStrings(strings);

    res.status(204).send(); 
  } catch (error) {
    next(error);
  }
};


export const filterByNaturalLanguage = (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      const err = new Error("Missing 'query' parameter");
      err.statusCode = 400;
      throw err;
    }

    const strings = loadStrings();

    const parsedFilters = parseNaturalLanguageQuery(query.toLowerCase());
    const result = applyFilters(strings, parsedFilters);

    res.status(200).json({
      data: result.data,
      count: result.count,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (error) {
    next(error);
  }
};


const parseNaturalLanguageQuery = (text) => {
  const filters = {};

  if (text.includes("palindromic")) filters.is_palindrome = true;
  if (text.includes("single word")) filters.word_count = 1;

  const matchLength = text.match(/longer than (\d+)/);
  if (matchLength) filters.min_length = parseInt(matchLength[1]) + 1;

  const matchMaxLength = text.match(/shorter than (\d+)/);
  if (matchMaxLength) filters.max_length = parseInt(matchMaxLength[1]) - 1;

  const matchContains = text.match(/containing the letter (\w)/);
  if (matchContains) filters.contains_character = matchContains[1];

  if (Object.keys(filters).length === 0) {
    const err = new Error("Unable to parse natural language query");
    err.statusCode = 400;
    throw err;
  }

  return filters;
};
