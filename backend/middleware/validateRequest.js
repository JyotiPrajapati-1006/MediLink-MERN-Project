// middleware/validateRequest.js

import Joi from "joi";

// Generic middleware function that takes a Joi schema
const validateRequest = (schema) => {
  return (req, res, next) => {
    // We validate against the request body
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Report all errors, not just the first one
      stripUnknown: true, // Remove unknown fields from the validated object
    });

    if (error) {
      // If validation fails, map the errors to a simple array of messages
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Invalid request data.",
        errors,
      });
    }

    // If validation is successful, proceed to the next middleware/controller
    next();
  };
};

// --- Schemas for Different Routes ---

export const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("customer", "shop-owner"),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  brand: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().hex().length(24).required(), // Mongoose ObjectId
  price: Joi.number().min(0).required(),
  countInStock: Joi.number().min(0).integer().required(),
  requiresPrescription: Joi.boolean(),
});

export default validateRequest;
