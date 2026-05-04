const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error(
    JSON.stringify({
      level: "error",
      requestId: req?.requestId,
      method: req?.method,
      path: req?.originalUrl,
      statusCode,
      message: err.message || "Server Error",
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    })
  );

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    requestId: req?.requestId,
  });
};

export default errorHandler;
