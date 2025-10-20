// middlewares/validateStringInput.js

export const validateStringInput = (req, res, next) => {
  // If body parser not used or body missing, respond 400
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid request body. Expected JSON." });
  }

  // Avoid destructuring from undefined
  const value = Object.prototype.hasOwnProperty.call(req.body, "value")
    ? req.body.value
    : undefined;

  if (value === undefined) {
    // Missing field -> 400 Bad Request
    return res.status(400).json({ error: "Missing 'value' field in request body." });
  }

  if (typeof value !== "string") {
    // Invalid data type -> 422 Unprocessable Entity
    return res.status(422).json({ error: "'value' must be a string." });
  }

  // Value exists and is string -> continue
  next();
};
