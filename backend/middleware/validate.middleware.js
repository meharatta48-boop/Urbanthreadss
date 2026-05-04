import { validationResult } from "express-validator";
import { sendError } from "../utils/apiResponse.js";

const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((issue) => ({
    field: issue.path,
    message: issue.msg,
  }));

  return sendError(res, "Validation failed", 400, { errors });
};

export default validateRequest;
