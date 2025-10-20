
export const applyFilters = (strings, query) => {
  let filtered = [...strings];

  // Parse and normalize incoming query parameters to typed values where possible
  const parsed = {};

  if (query.is_palindrome !== undefined) {
    const raw = query.is_palindrome;
    parsed.is_palindrome =
      typeof raw === "boolean" ? raw : raw.toString().toLowerCase() === "true";
  }

  if (query.min_length !== undefined) {
    const n = parseInt(query.min_length, 10);
    if (Number.isNaN(n)) throwTypedError("min_length must be an integer");
    parsed.min_length = n;
  }

  if (query.max_length !== undefined) {
    const n = parseInt(query.max_length, 10);
    if (Number.isNaN(n)) throwTypedError("max_length must be an integer");
    parsed.max_length = n;
  }

  if (query.word_count !== undefined) {
    const n = parseInt(query.word_count, 10);
    if (Number.isNaN(n)) throwTypedError("word_count must be an integer");
    parsed.word_count = n;
  }

  if (query.contains_character !== undefined) {
    if (typeof query.contains_character !== "string") {
      throwTypedError("contains_character must be a string");
    }
    parsed.contains_character = query.contains_character.toLowerCase();
  }

  // Apply filters
  if (parsed.is_palindrome !== undefined) {
    filtered = filtered.filter((item) => item.properties.is_palindrome === parsed.is_palindrome);
  }

  if (parsed.min_length !== undefined) {
    filtered = filtered.filter((item) => item.properties.length >= parsed.min_length);
  }

  if (parsed.max_length !== undefined) {
    filtered = filtered.filter((item) => item.properties.length <= parsed.max_length);
  }

  if (parsed.word_count !== undefined) {
    filtered = filtered.filter((item) => item.properties.word_count === parsed.word_count);
  }

  if (parsed.contains_character !== undefined) {
    filtered = filtered.filter((item) =>
      item.value.toLowerCase().includes(parsed.contains_character)
    );
  }

  return {
    data: filtered,
    count: filtered.length,
    filters_applied: buildAppliedFilters(parsed),
  };
};

const throwTypedError = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  throw err;
};

const buildAppliedFilters = (parsed) => {
  // Return the typed filters as they were applied
  const applied = {};
  if (parsed.is_palindrome !== undefined) applied.is_palindrome = parsed.is_palindrome;
  if (parsed.min_length !== undefined) applied.min_length = parsed.min_length;
  if (parsed.max_length !== undefined) applied.max_length = parsed.max_length;
  if (parsed.word_count !== undefined) applied.word_count = parsed.word_count;
  if (parsed.contains_character !== undefined) applied.contains_character = parsed.contains_character;
  return applied;
};
