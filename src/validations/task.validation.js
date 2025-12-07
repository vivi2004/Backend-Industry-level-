import Joi from "joi";

// ------------------------------
// CREATE TASK VALIDATION
// ------------------------------
export const createTaskSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(150).required().messages({
      "string.empty": "Task title is required",
      "string.min": "Task title must be at least 3 characters",
    }),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid("pending", "in-progress", "completed").optional(),
  }),
};

// ------------------------------
// UPDATE TASK VALIDATION
// ------------------------------
export const updateTaskSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(150).optional(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid("pending", "in-progress", "completed").optional(),
  }),
};

// ------------------------------
// TASK ID PARAM VALIDATION
// ------------------------------
export const taskIdSchema = {
  params: Joi.object({
    taskId: Joi.string().length(24).required().messages({
      "string.length": "Invalid task ID",
    }),
  }),
};

// ------------------------------
// PROJECT + TASK PARAMS TOGETHER
// ------------------------------
export const projectTaskParamsSchema = {
  params: Joi.object({
    projectId: Joi.string().length(24).required().messages({
      "string.length": "Invalid project ID",
    }),
    taskId: Joi.string().length(24).required().messages({
      "string.length": "Invalid task ID",
    }),
  }),
};
