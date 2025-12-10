const WORKER_SECRET = process.env.WORKER_SECRET;

if (!WORKER_SECRET) {
  console.error("❌ WORKER_SECRET is missing in .env");
  throw new Error("Worker authentication disabled: WORKER_SECRET not configured");
}

export const requireWorker = (req, res, next) => {
  const headerSecret = req.headers["x-worker-secret"];

  // Normalize to avoid whitespace mismatch
  const cleanHeader = headerSecret ? headerSecret.trim() : null;

  if (!cleanHeader || cleanHeader !== WORKER_SECRET) {
    return res.status(403).json({
      message: "Forbidden: Worker authentication failed",
    });
  }

  // Attach a minimal worker identity
  req.user = { id: "worker" };

  next();
};
