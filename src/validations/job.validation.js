import Joi from "joi";

// ------------------------------
// JOB ID VALIDATION
// ------------------------------
export const jobIdSchema = {
  params: Joi.object({
    id: Joi.string().length(24).required().messages({
      "string.empty": "Job ID is required",
      "string.length": "Job ID must be a valid 24‑character MongoDB ObjectId",
    }),
  }),
};
