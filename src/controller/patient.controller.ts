import { Request, Response, NextFunction } from "express";
import * as patientService from "../services/patient.service";
import { successResponse } from "../utils/response";
import { CreatePatientInput } from "../validations/patient.schema";

export const createPatient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const patientData = req.body as CreatePatientInput;

        const patient = await patientService.registerPatient(patientData);

        return successResponse(
            res,
            patient,
            "Patient registered successfully",
            201
        );
    } catch (err) {
        next(err);
    }
};

export const getPatients = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { search } = req.query;
        const data = await patientService.getAllPatients(search as string);
        return successResponse(res, data, "Patients retrieved successfully");
    } catch (err) { next(err); }
};

export const getPatientById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await patientService.getPatientById(Number(req.params.id));
        return successResponse(res, data, "Patient found");
    } catch (err) { next(err); }
};

export const updatePatient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await patientService.updatePatient(Number(req.params.id), req.body);
        return successResponse(res, data, "Patient updated successfully");
    } catch (err) { next(err); }
};

export const deletePatient = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await patientService.deletePatient(Number(req.params.id));
        return successResponse(res, null, "Patient deleted successfully");
    } catch (err) { next(err); }
};

export const verifyFace = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { descriptor } = req.body;

        if (!descriptor || !Array.isArray(descriptor)) {
            throw { status: 400, message: "Face descriptor is required for authentication." };
        }

        const faceRecords = await patientService.searchPatientByFace(descriptor);

        return successResponse(res, faceRecords, "Face templates retrieved for comparison");
    } catch (err) {
        next(err);
    }
};