import crypto from "crypto";

export const requestContext = (req, res, next) => {
  const inboundRequestId = req.headers["x-request-id"];
  req.requestId =
    (typeof inboundRequestId === "string" && inboundRequestId.trim()) ||
    crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};

export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const logPayload = {
      level: "info",
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: req.user?._id?.toString?.() || null,
    };
    console.log(JSON.stringify(logPayload));
  });

  next();
};
