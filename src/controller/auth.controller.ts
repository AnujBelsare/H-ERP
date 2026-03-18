import { NextFunction, Request, Response } from "express";
import { loginUser } from "../services/auth.service";
import {successResponse} from '../utils/response'

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try{
        const {email, password} = req.body;

        if(!email || !password) throw {status: 400, message: "Email and Password required"};

        const data = await loginUser(email, password);

        return successResponse(res, data, "Login Successful");
    }
    catch(err){
        next(err);
    }
}