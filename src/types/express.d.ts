import * as express from 'express';
import * as multer from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "admin" | "doctor" | "receptionist" | "technician";
      };
      file?: Express.Multer.File;
      files?: {
        [fieldname: string]: Express.Multer.File[];
      } | Express.Multer.File[];
    }
  }
}