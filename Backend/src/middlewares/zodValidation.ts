import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body, query, and params against the schema
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e: any) {
    if (e instanceof ZodError) {
        // Return clear error messages if validation fails
      return res.status(400).json({
        message: "Validation Error",
        errors: e.issues.map(err => ({ field: err.path[1], message: err.message }))
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};