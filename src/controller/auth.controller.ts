import { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { successResponse } from '../utils/response'

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) throw { status: 400, message: "Email and Password required" };

        const data = await loginUser(email, password);

        return successResponse(res, data, "Login Successful", 200);
    }
    catch (err) {
        next(err);
    }
}

export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) throw { status: 400, message: "All fields are required" };

        const user = await registerUser({
            name,
            email,
            password,
            role: 'technician'
        });

        return successResponse(res, user, "User registered successfully", 201);
    }
    catch (err) {
        next(err);
    }
}