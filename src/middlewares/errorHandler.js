const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || "Something went wrong",
    statusCode,
  };

  // Include validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  // Include stack only in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
