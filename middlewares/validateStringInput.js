export const validateStringInput = (req, res, next) => {
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: "Missing 'value' field" });
  }

  if (typeof value !== "string") {
    return res.status(422).json({ error: "'value' must be a string" });
  }

  next();
};
