// middlewares/validateStringInput.js
export const validateStringInput = (req, res, next) => {
  // Ensure body parser is present
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid request body. Expected JSON." });
  }

  if (!Object.prototype.hasOwnProperty.call(req.body, "value")) {
    return res.status(400).json({ error: "Missing 'value' field in request body." });
  }

  const { value } = req.body;

  if (typeof value !== "string") {
    return res.status(422).json({ error: "'value' must be a string." });
  }

  next();
};
