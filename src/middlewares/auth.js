import jwt from "jsonwebtoken";
import User from "../models/User.js";

const WORKER_SECRET = process.env.WORKER_SECRET;

const auth = async (req, res, next) => {
  try {
    // Allow internal worker calls
    const workerSecret = req.headers["x-worker-secret"];
    if (workerSecret && workerSecret === WORKER_SECRET) {
      req.user = { id: "worker" }; // minimal identity
      return next();
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
export default auth;
