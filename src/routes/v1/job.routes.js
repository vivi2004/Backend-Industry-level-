import { Router } from "express";
import { getJobById, getJobs , getJobProgress ,streamJobProgress } from "../../controllers/v1/job.controller.js";
import authenticate from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { jobIdSchema } from "../../validations/job.validation.js";

const router = Router();

router.get(
  "/:id",
  authenticate,
  authorize("user", "admin"),
  validate(jobIdSchema),
  getJobById
);
router.get("/", authenticate, authorize("user", "admin"), getJobs);
router.get(
  "/:id/progress",
  authenticate,
  authorize("admin", "user"),
  validate(jobIdSchema),
  getJobProgress
);
router.get(
  "/:id/stream",
  authenticate,
  authorize("user", "admin"),
  validate(jobIdSchema),
  streamJobProgress
);

export default router;
