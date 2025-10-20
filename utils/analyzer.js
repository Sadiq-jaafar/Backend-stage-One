import crypto from "crypto";

export function analyzeString(value) {
  const trimmed = value.trim();
  const length = trimmed.length;
  const normalized = trimmed.toLowerCase().replace(/\s+/g, "");
  const is_palindrome = normalized === normalized.split("").reverse().join("");
  const unique_characters = new Set(trimmed).size;
  const word_count = trimmed.split(/\s+/).filter(Boolean).length;
  const sha256_hash = crypto.createHash("sha256").update(trimmed).digest("hex");

  const character_frequency_map = {};
  for (let char of trimmed) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}
