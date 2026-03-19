import * as express from 'express';
import { User } from '../drizzle/schema/users';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        role: "admin" | "doctor" | "receptionist" | "technician";
      };
    }
  }
}