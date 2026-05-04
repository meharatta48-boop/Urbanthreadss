export const sendSuccess = (res, payload = {}, statusCode = 200) => {
  const body = { success: true, ...payload };
  return res.status(statusCode).json(body);
};

export const sendError = (res, message, statusCode = 500, extra = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...extra,
  });
};
