import { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { successResponse } from '../utils/response'
import { LoginInput, SignupInput } from "../validations/auth.schema";

export const login = async (
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const data = await loginUser(email, password);

        return successResponse(res, data, "Login Successful", 200);
    }
    catch (err) {
        next(err);
    }
}

export const signup = async (
    req: Request<{}, {}, SignupInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, password } = req.body;

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