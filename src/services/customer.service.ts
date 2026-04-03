import { db } from "../drizzle/index";
import { users } from "../drizzle/schema/users";

export const getAllCustomers = async () => {
    const result = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
    }).from(users);
    return result;
};
