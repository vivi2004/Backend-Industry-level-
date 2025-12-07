import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../../controllers/v1/project.controller.js";

import { upload } from "../../middlewares/upload.js";
import { uploadLimiter } from "../../middlewares/rateLimit.js";
import { uploadProjectAttachment } from "../../controllers/v1/upload.controller.js";

import { validate } from "../../middlewares/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from "../../validations/project.validation.js";

const router = Router();
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateProject"
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authorize("admin", "user"),
  validate(createProjectSchema),
  createProject
);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects (paginated)
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get(
  "/",
  authorize("admin", "user"),
  getProjects
);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateProject"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 */
router.put(
  "/:id",
  authorize("admin", "user"),
  validate(projectIdSchema),
  validate(updateProjectSchema),
  updateProject
);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete(
  "/:id",
  authorize("admin", "user"),
  validate(projectIdSchema),
  deleteProject
);

/**
 * @swagger
 * /projects/{id}/attachments:
 *   post:
 *     summary: Upload an attachment to a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 */
router.post(
  "/:id/attachments",
  authorize("admin", "user"),
  validate(projectIdSchema),
  uploadLimiter,
  upload.single("file"),
  uploadProjectAttachment
);
export default router;
