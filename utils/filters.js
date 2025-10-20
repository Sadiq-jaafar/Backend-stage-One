
export const applyFilters = (strings, query) => {
  let filtered = [...strings]; 

  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = query;

  try {
    if (is_palindrome !== undefined) {
      const boolValue =
        typeof is_palindrome === "boolean"
          ? is_palindrome
          : is_palindrome.toString().toLowerCase() === "true";

      filtered = filtered.filter(
        (item) => item.properties.is_palindrome === boolValue
      );
    }

    if (min_length !== undefined) {
      const min = parseInt(min_length, 10);
      if (isNaN(min)) throw new Error("Invalid min_length parameter");
      filtered = filtered.filter((item) => item.properties.length >= min);
    }

    if (max_length !== undefined) {
      const max = parseInt(max_length, 10);
      if (isNaN(max)) throw new Error("Invalid max_length parameter");
      filtered = filtered.filter((item) => item.properties.length <= max);
    }

    if (word_count !== undefined) {
      const count = parseInt(word_count, 10);
      if (isNaN(count)) throw new Error("Invalid word_count parameter");
      filtered = filtered.filter(
        (item) => item.properties.word_count === count
      );
    }

    if (contains_character !== undefined) {
      if (typeof contains_character !== "string") {
        throw new Error("Invalid contains_character parameter");
      }
      const char = contains_character.toLowerCase();
      filtered = filtered.filter((item) =>
        item.value.toLowerCase().includes(char)
      );
    }

    return {
      data: filtered,
      count: filtered.length,
      filters_applied: cleanAppliedFilters(query),
    };
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }
};


const cleanAppliedFilters = (query) => {
  const validKeys = [
    "is_palindrome",
    "min_length",
    "max_length",
    "word_count",
    "contains_character",
  ];
  const applied = {};
  for (const key of validKeys) {
    if (query[key] !== undefined) {
      applied[key] = query[key];
    }
  }
  return applied;
};
