import Joi from "joi";

// ------------------------------
// CREATE PROJECT VALIDATION
// ------------------------------
export const createProjectSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      "string.empty": "Project name is required",
      "string.min": "Project name must be at least 3 characters",
    }),
    description: Joi.string().max(500).optional(),
  }),
};

// ------------------------------
// UPDATE PROJECT VALIDATION
// ------------------------------
export const updateProjectSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
  }),
};

// ------------------------------
// PROJECT ID PARAM VALIDATION
// ------------------------------
export const projectIdSchema = {
  params: Joi.object({
    projectId: Joi.string().length(24).required().messages({
      "string.length": "Invalid project ID",
    }),
  }),
};



