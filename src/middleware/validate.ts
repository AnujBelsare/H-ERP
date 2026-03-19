import { Request, Response, NextFunction } from "express";
import { ZodTypeAny, ZodError } from "zod";
import { errorResponse } from "../utils/response";

export const validate = (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return errorResponse(res, "Validation Error", 400, details);
      }

      return next(error);
    }
  };