import { eq, ilike, or, isNotNull } from "drizzle-orm";
import { db } from "../drizzle/index";
import { Patient, NewPatient, patients } from "../drizzle/schema/patients";

export const registerPatient = async (patientData: NewPatient) => {
    const existingPatinet = await db
        .select()
        .from(patients)
        .where(eq(patients.phone, patientData.phone))
        .limit(1);

    if (existingPatinet.length > 0) throw { status: 409, message: `Patient with phone number ${patientData.phone} is already registered.` };

    const [newPatient] = await db
        .insert(patients)
        .values(patientData)
        .returning();

    return newPatient;
}

export const getPatientById = async (id: number) => {
    const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.id, id))
        .limit(1);

    if (!patient.length) throw { status: 404, message: "Patient not found" };
    return patient[0];
};

export const getAllPatients = async (searchTerm?: string) => {
    if (searchTerm) {
        return await db.select().from(patients).where(
            or(
                ilike(patients.name, `%${searchTerm}%`),
                ilike(patients.phone, `%${searchTerm}%`)
            )
        );
    }
    return await db.select().from(patients);
};

export const updatePatient = async (id: number, updateData: Partial<NewPatient>) => {
    const [updated] = await db
        .update(patients)
        .set(updateData)
        .where(eq(patients.id, id))
        .returning();

    if (!updated) throw { status: 404, message: "Patient not found" };
    return updated;
};


export const deletePatient = async (id: number) => {
    const [deleted] = await db
        .delete(patients)
        .where(eq(patients.id, id))
        .returning();

    if (!deleted) throw { status: 404, message: "Patient not found" };
    return deleted;
};

export const searchPatientByFace = async (capturedFaceDescriptor: number[]) => {
    const allPatientsWithFace = await db
        .select()
        .from(patients)
        .where(isNotNull(patients.faceData));

    if (allPatientsWithFace.length === 0) {
        throw { status: 404, message: "No face records found in database." };
    }

    return allPatientsWithFace.map(p => ({
        id: p.id,
        name: p.name,
        faceData: JSON.parse(p.faceData as string)
    }));
};