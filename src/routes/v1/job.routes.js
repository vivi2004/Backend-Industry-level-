import { Router } from "express";
import { getJobById, getJobs , getJobProgress ,streamJobProgress } from "../../controllers/v1/job.controller.js";
import { cancelJob } from "../../controllers/v1/job.controller.js";
import authenticate from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { jobIdSchema } from "../../validations/job.validation.js";
import { requireWorker } from "../../middlewares/workerAuth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job processing and status tracking
 */

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get a job by its ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — you cannot access this job
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  requireWorker,
  validate(jobIdSchema),
  getJobById
);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get paginated list of jobs for the authenticated user (admin sees all)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         example: completed
 *     responses:
 *       200:
 *         description: List of jobs returned successfully
 *       401:
 *         description: Unauthorized — login required
 *       500:
 *         description: Server error
 */
router.get("/", authenticate, authorize("user", "admin"), getJobs);

/**
 * @swagger
 * /jobs/{id}/progress:
 *   get:
 *     summary: Get real-time progress information for a job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Progress information retrieved
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized — login required
 *       403:
 *         description: Forbidden — cannot access job
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id/progress",
  authenticate,
  authorize("admin", "user"),
  validate(jobIdSchema),
  getJobProgress
);

/**
 * @swagger
 * /jobs/{id}/stream:
 *   get:
 *     summary: Stream job progress using SSE (Server-Sent Events)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: SSE stream started
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id/stream",
  authenticate,
  authorize("user", "admin"),
  validate(jobIdSchema),
  streamJobProgress
);

/**
 * @swagger
 * /jobs/{id}/cancel:
 *   delete:
 *     summary: Cancel an active job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to cancel
 *     responses:
 *       200:
 *         description: Job cancelled successfully
 *       400:
 *         description: Job already completed or cannot be cancelled
 *       401:
 *         description: Unauthorized — login required
 *       403:
 *         description: Forbidden — you cannot cancel this job
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id/cancel",
  authenticate,
  authorize("user", "admin"),
  validate(jobIdSchema),
  cancelJob
);

export default router;