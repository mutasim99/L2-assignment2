import { pool } from "../../database/db";


export type UserRole = 'admin' | 'customer';

export interface UpdateUserInput {
    name?: string;
    email?: string;
    Phone?: number;
    role?: UserRole
};

const getAllUsersFromDb = async () => {
    const result = await pool.query(`
        SELECT id, name, email, phone, role FROM users
        ORDER BY id
        `)
    return result.rows;
};

const getUserByIdFromDb = async (userId: number) => {
    const result = await pool.query(`
        SELECT id, name, email, phone, role FROM users
        WHERE id = $1
        `, [userId]);
    return result.rows[0];
};

const isEmailTakenByAntherUser = async (email: string, userId: number) => {
    const result = await pool.query(`
        SELECT id
        FROM users
        WHERE email = LOWER($1) AND id <>$2
        `, [email, userId]);
};

const updateUserInDb = async (userId: number, payload: UpdateUserInput) => {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (payload.name) {
        fields.push(`name = $${idx}`);
        values.push(payload.name);
        idx++;
    };

    if (payload.email) {
        fields.push(`email = LOWER($${idx})`);
        values.push(payload.email);
        idx++;
    };

    if (payload.Phone !== undefined) {
        fields.push(`phone = $${idx}`);
        values.push(payload.Phone);
        idx++
    };

    if (payload.role) {
        fields.push(`role = $${idx}`);
        values.push(payload.role);
        idx++;
    };

    if (fields.length === 0) {
        throw new Error("No fields to update");
    };

    values.push(userId);

    const query = `
    UPDATE uses
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING id, name, email, phone, role
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
};

const hasActiveBookings = async (userId: number) => {
    const result = await pool.query(`
        SELECT 1
        FROM bookings
        WHERE customer_id = $1 AND status = 'active
        LIMIT 1
        `, [userId])
    return result.rowCount! > 0
};

const deleteUserFromDb = async (userId: number) => {
    await pool.query(`
        DELETE FROM users
        WHERE id = $1
        `, [userId]);
};

export const userServices = {
    getAllUsersFromDb,
    getUserByIdFromDb,
    isEmailTakenByAntherUser,
    updateUserInDb,
    hasActiveBookings,
    deleteUserFromDb
}
