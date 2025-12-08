import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import path from 'path'
import { pool } from "../../database/db";

dotenv.config({ path: path.join(process.cwd(), '.env') });

export type UserRole = 'admin' | 'customer';

interface SignupInput {
    name: string;
    email: string;
    password: string;
    phone: number;
    role?: UserRole;
};



/* Signup user */
const signupUserIntoDb = async (payload: SignupInput) => {
    const { name, email, password, phone, role } = payload;

    if (password.length < 6) {
        throw new Error('password must be at least 6 characters')
    };

    const existingUser = await pool.query(`
        SELECT id FROM users WHERE email = LOWER($1)
        `, [email]);

    if (existingUser.rowCount && existingUser.rowCount > 0) {
        throw new Error("Email already exists");

    };

    const hashedPassword = await bcrypt.hash(password, 12);

    const userRole = role || 'customer';

    const result = await pool.query(`
        INSERT INTO users (name, email, password, phone, role)
        VALUES ($1, LOWER($2), $3, $4, $5)
        RETURNING  id, name, email, phone, role
        `, [name, email, hashedPassword, phone, userRole]);
    return result.rows[0];
};

// login user

const loginUserIntoDb = async (email: string, password: string) => {
    const user = await pool.query(`
        SELECT * FROM users WHERE email=LOWER($1)
        `, [email]);

    if (user.rowCount === 0) {
        throw new Error("user not found");
    };

    const matchPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!matchPassword) {
        throw new Error("invalid credentials");

    };

    const userInfo = user.rows[0];
    const payload = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("Missing secret key");

    };

    const token = jwt.sign(payload, secret, { expiresIn: "1d" });

    return { token, user: userInfo };
};

export const authServices = {
    signupUserIntoDb,
    loginUserIntoDb,
}