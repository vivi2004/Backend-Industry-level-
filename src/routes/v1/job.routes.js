import { Router } from "express";
import { getJobById, getJobs } from "../../controllers/v1/job.controller.js";
import authenticate from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";

const router = Router();


router.get("/:id", authenticate, authorize("user", "admin"), getJobById);
router.get("/", authenticate, authorize("user", "admin"), getJobs);


export default router;
