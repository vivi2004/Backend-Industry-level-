import Joi from "joi";

/**
 * Generic request validation middleware
 * Usage: validate(schema)
 * Where schema = { body, params, query }
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validationTargets = ["params", "body", "query"];

      for (const key of validationTargets) {
        if (schema[key]) {
          const { error, value } = schema[key].validate(req[key], {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
          });

          if (error) {
            const formattedErrors = {};
            error.details.forEach((detail) => {
              formattedErrors[detail.path.join(".")] = detail.message;
            });

            return res.status(400).json({
              success: false,
              message: "Validation failed",
              statusCode: 400,
              errors: formattedErrors,
            });
          }

          // Replace with validated & sanitized data
          req[key] = value;
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
