// utils/filters.js

export const applyFilters = (strings, query) => {
  let filtered = [...strings];
  const parsed = {};

  // parse boolean
  if (query.is_palindrome !== undefined) {
    const raw = query.is_palindrome;
    parsed.is_palindrome =
      typeof raw === "boolean" ? raw : raw.toString().toLowerCase() === "true";
  }

  // numeric parsers with validation
  if (query.min_length !== undefined) {
    const n = parseInt(query.min_length, 10);
    if (Number.isNaN(n)) throw badQuery("min_length must be an integer");
    parsed.min_length = n;
  }
  if (query.max_length !== undefined) {
    const n = parseInt(query.max_length, 10);
    if (Number.isNaN(n)) throw badQuery("max_length must be an integer");
    parsed.max_length = n;
  }
  if (query.word_count !== undefined) {
    const n = parseInt(query.word_count, 10);
    if (Number.isNaN(n)) throw badQuery("word_count must be an integer");
    parsed.word_count = n;
  }

  if (query.contains_character !== undefined) {
    if (typeof query.contains_character !== "string")
      throw badQuery("contains_character must be a string");
    parsed.contains_character = query.contains_character.toLowerCase();
  }

  // apply filters
  if (parsed.is_palindrome !== undefined) {
    filtered = filtered.filter((s) => s.properties.is_palindrome === parsed.is_palindrome);
  }
  if (parsed.min_length !== undefined) {
    filtered = filtered.filter((s) => s.properties.length >= parsed.min_length);
  }
  if (parsed.max_length !== undefined) {
    filtered = filtered.filter((s) => s.properties.length <= parsed.max_length);
  }
  if (parsed.word_count !== undefined) {
    filtered = filtered.filter((s) => s.properties.word_count === parsed.word_count);
  }
  if (parsed.contains_character !== undefined) {
    filtered = filtered.filter((s) =>
      s.value.toLowerCase().includes(parsed.contains_character)
    );
  }

  return {
    data: filtered,
    count: filtered.length,
    filters_applied: parsed,
  };
};

const badQuery = (msg) => {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
};
