export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack);

  const statusCode = err.statusCode || 500;
  const message =
    err.message || "An unexpected server error occurred. Please try again later.";

  res.status(statusCode).json({
    error: message,
  });
};