import { eq } from 'drizzle-orm'
import { db } from '../drizzle/index'
import { NewUser, users } from '../drizzle/schema/users'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const loginUser = async (
    email: string,
    password: string
) => {
    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user.length) throw { status: 404, message: "User Not Found!" };

    const validPass = await bcrypt.compare(password, user[0].password);

    if (!validPass) throw { status: 401, message: "Invalid Credentials!" };

    const token = jwt.sign(
        { id: user[0].id, role: user[0].role },
        env.JWT_SECRET,
        { expiresIn: "2d" }
    );

    return { token, user: user[0] };
}

export const registerUser = async (userData: NewUser) => {
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

    if (existingUser.length > 0) throw { status: 409, message: "User with this email already exists" };

    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(userData.password, salt);

    const [newUser] = await db.insert(users).values({
        ...userData,
        password: hashedPass,
    }).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role:users.role,
        createdAt: users.createdAt,
    });

    return newUser;
}