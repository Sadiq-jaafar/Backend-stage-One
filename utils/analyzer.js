// utils/analyzer.js
import crypto from "crypto";

/**
 * Analyze a string and return required properties.
 * - length: number of characters (includes spaces)
 * - is_palindrome: case-insensitive, ignores non-alphanumeric chars
 * - unique_characters: count of distinct characters (case-sensitive)
 * - word_count: words separated by whitespace
 * - sha256_hash: hex digest of the original value (no trimming)
 * - character_frequency_map: map each character (exact char) to counts
 */
export const analyzeString = (value) => {
  // value is used exactly as provided for length, frequency, and hashing
  const length = value.length;

  // Palindrome: normalize by removing non-alphanumerics and lowercasing
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const is_palindrome = normalized === normalized.split("").reverse().join("");

  // Unique characters (based on exact characters present)
  const unique_characters = new Set(value).size;

  const word_count = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  const character_frequency_map = {};
  for (const ch of value) {
    character_frequency_map[ch] = (character_frequency_map[ch] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
};
