import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

/**
 * Middleware factory for validating request body with Zod schema
 * @param schema - Zod schema for validation
 */
export const validateBody = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation error",
          details: formattedErrors,
        });
        return;
      }

      res.status(400).json({ error: "Invalid request data" });
    }
  };
};

/**
 * Middleware factory for validating request query parameters with Zod schema
 * @param schema - Zod schema for validation
 */
export const validateQuery = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation error in query parameters",
          details: formattedErrors,
        });
        return;
      }

      res.status(400).json({ error: "Invalid query parameters" });
    }
  };
};

/**
 * Middleware factory for validating request params with Zod schema
 * @param schema - Zod schema for validation
 */
export const validateParams = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation error in path parameters",
          details: formattedErrors,
        });
        return;
      }

      res.status(400).json({ error: "Invalid path parameters" });
    }
  };
};
