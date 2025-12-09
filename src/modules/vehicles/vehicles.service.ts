import { pool } from "../../database/db";


export type VehicleType = 'car' | 'bike' | 'van' | 'SUV';
export type AvailabilityStatus = 'available' | 'booked';

export interface VehicleRow {
    id: number;
    vehicle_name: string;
    type: VehicleType;
    registration_number: string;
    daily_rent_price: number;
    availability_status: AvailabilityStatus
};

interface CreateVehicleInput {
    vehicle_name: string;
    type: VehicleType;
    registration_number: string;
    daily_rent_price: number;
    availability_status?: AvailabilityStatus
};

interface UpdateVehicleInput {
    vehicle_name?: string;
    type?: VehicleType;
    registration_number?: string;
    daily_rent_price?: number;
    availability_status?: AvailabilityStatus
};

const createVehicleIntoDb = async (payload: CreateVehicleInput) => {
    if (payload.daily_rent_price <= 0) {
        const error: any = new Error('daily_rent_price must be a positive number');
        error.statusCode(400);
        throw error;
    };
    /* check unique registration number */
    const exists = await pool.query(`
        SELECT id FROM vehicles WHERE registration_number = $1 
        `, [payload.registration_number]);
    if (exists.rowCount! > 0) {
        const error: any = new Error('registration_number is already exists');
        error.statusCode(400);
        throw error;
    };

    const status = payload.availability_status || 'available';

    const result = await pool.query<VehicleRow>(`
        INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
        `, [payload.vehicle_name,
    payload.type,
    payload.registration_number,
    payload.daily_rent_price,
        status
    ]);
    return result.rows[0];
};

/* Get all vehicles */
const getAllVehiclesFromDb = async () => {
    const result = await pool.query<VehicleRow>(`
        SELECT id, vehicle_name, type,registration_number, daily_rent_price, availability_status FROM vehicles ORDER BY id
        `)
    return result.rows;
};

/* get single vehicle */

const getVehicleByIdFromDb = async (id: number) => {
    const result = await pool.query<VehicleRow>(`
        SELECT * FROM vehicles WHERE id = $1
        `, [id]);
    return result.rows[0]
};

/* Update vehicle into db */

const UpdateVehicleInDb = async (id: number, payload: UpdateVehicleInput) => {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    /* update vehicle name */
    if (payload.vehicle_name) {
        fields.push(`vehicle_name = $${idx++}`);
        values.push(payload.vehicle_name)
    };

    /* update vehicle type */
    if (payload.type) {
        fields.push(`type = $${idx++}`);
        values.push(payload.type)
    };

    /* update vehicle registration number */
    if (payload.registration_number) {
        const check = await pool.query(`
            SELECT id FROM vehicles WHERE registration_number = $1 AND id <>$2
            `, [payload.registration_number, id]);

        if (check.rowCount! > 0) {
            const error: any = new Error('registration_number is already exists');
            error.statusCode(400);
            throw error;
        };

        fields.push(`registration_number = $${idx++}`);
        values.push(payload.registration_number);
    };

    /* update daily rent price */
    if (typeof payload.daily_rent_price === 'number') {
        if (payload.daily_rent_price <= 0) {
            const error: any = new Error('rent price is must be a positive number');
            error.statusCode(400);
            throw error;
        };

        fields.push(`daily_rent_price = $${idx++}`);
        values.push(payload.daily_rent_price)
    };

    /* update available status */
    if (payload.availability_status) {
        fields.push(`availability_status = $${idx++}`)
        values.push(payload.availability_status)
    };

    if (fields.length === 0) {
        return await getVehicleByIdFromDb(id)
    };
    values.push(id);

    const sql = `
    UPDATE vehicles 
    SET ${fields.join(',')} 
    WHERE id = $${idx}
    RETURNING id, vehicle_name, type,registration_number, daily_rent_price, availability_status
    `;

    const result = await pool.query<VehicleRow>(sql, values);
    return result.rows[0];
};

const vehicleHasActiveBookings = async (vehicleId: number) => {
    const result = await pool.query<{ count: string }>(`
        SELECT COUNT(*):: int as count FROM bookings WHERE vehicle_id = $1 AND status = 'active
        `, [vehicleId])
    return Number(result.rows[0]?.count) > 0
};

const deleteVehicleFromDb = async (id: number) => {
    const result = await pool.query(`DELETE FROM vehicles WHERE id = $1`, [id])
    return result.rowCount;
};

const setVehicleAvailability = async (id: number, status: AvailabilityStatus) => {
    await pool.query(`UPDATE vehicles SET availability_status = $1 WHERE id = $2`, [status,id])
};

export const vehicleServices = {
    createVehicleIntoDb,
    getAllVehiclesFromDb,
    getVehicleByIdFromDb,
    UpdateVehicleInDb,
    deleteVehicleFromDb,
    vehicleHasActiveBookings,
    setVehicleAvailability
}


