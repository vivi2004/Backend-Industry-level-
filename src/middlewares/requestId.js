import { randomUUID } from "crypto";

export const assignRequestId = (req, res, next) => {
  req.id = randomUUID(); // unique request ID
  next();
};
