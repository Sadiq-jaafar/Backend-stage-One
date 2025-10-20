
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected server error occurred.";
  res.status(status).json({ error: message });
};
