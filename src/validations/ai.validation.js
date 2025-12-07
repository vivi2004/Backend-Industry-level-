import Joi from "joi";

// ------------------------------
// AI TEXT EXTRACTION VALIDATION
// ------------------------------
export const aiExtractSchema = {
  body: Joi.object({
    fileUrl: Joi.string().uri().required().messages({
      "string.empty": "fileUrl is required",
      "string.uri": "fileUrl must be a valid URL",
    }),
    mode: Joi.string().valid("extract-only", "extract+summary").optional(),
  }),
};

// ------------------------------
// AI SUMMARIZATION VALIDATION
// ------------------------------
export const aiSummarizeSchema = {
  body: Joi.object({
    text: Joi.string().min(10).required().messages({
      "string.empty": "text is required",
      "string.min": "text must be at least 10 characters",
    }),
    level: Joi.string()
      .valid("short", "medium", "detailed")
      .default("medium")
      .optional(),
  }),
};
