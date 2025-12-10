import { pool } from "../../database/db";


export type BookingStatus = "active" | "cancelled" | "returned";
interface CreateBookingInput {
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string
};

const CreateBookingInDb = async (payload: CreateBookingInput) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;
    const vehicleResult = await pool.query(`
        SELECT id, vehicle_name, daily_rent_price, availability_status FROM vehicles where ID = $1
        `, [vehicle_id]);

    if (vehicleResult.rowCount === 0) {
        throw new Error("Vehicle not found");
    };

    const vehicle = vehicleResult.rows[0];

    if (vehicle.availability_status !== 'available') {
        throw new Error("vehicle is not available for bookings");
    };

    /* validate date */
    const rentStart = new Date(rent_start_date);
    const rentEnd = new Date(rent_end_date);

    if (isNaN(rentStart.getTime()) || isNaN(rentEnd.getTime())) {
        throw new Error("invalid rent start and end date");
    };
    if (rentEnd <= rentStart) {
        throw new Error("rent end date must be after rent start date");
    };

    const diffMs = rentEnd.getTime() - rentStart.getTime();
    const numberOfDays = diffMs / (1000 * 60 * 60 * 24);

    if (numberOfDays < 1) {
        throw new Error("Bookings must be at least 1 day");
    };

    const totalPrice = vehicle.daily_rent_price * numberOfDays;

    /* Create a bookings */
    const bookingResult = await pool.query(`
        INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
        VALUES($1, $2, $3, $4, $5, 'active')
        RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
        `, [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]);

    /* update vehicle status */
    await pool.query(`
        UPDATE vehicles SET availability_status = 'booked' WHERE id = $1
        `, [vehicle_id]);

    const booking = bookingResult.rows[0];
    return {
        ...booking,
        vehicle: {
            vehicle_name: vehicle.vehicle_name,
            daily_rent_price: vehicle.daily_rent_price
        },
    };
};

const getAllBookingsForAdminFromDb = async () => {
    const result = await pool.query(`
        SELECT
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        u.name as customer_name,
        u.email as customer_email,
        v.vehicle_name,
        v.registration_number
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        ORDER BY b.id
        `)
    return result.rows
};

const getBookingsForCustomerFromDb = async (customerId: number) => {
    const result = await pool.query(`
        SELECT
        b.id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        v.vehicle_name,
        v.registration_number,
        v.type
        FROM bookings b
        JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.customer_id = $1
        ORDER BY b.id
        `, [customerId]);
    return result.rows;
};

const getBookingByIdFromDb = async (bookingId: number) => {
    const result = await pool.query(`
        SELECT * FROM bookings WHERE id = $1
        `, [bookingId]);
    return result.rows[0]
};

const updateBookingStatusInDb = async (bookingId: number, status:BookingStatus) => {
    const result = await pool.query(`
        UPDATE bookings SET status = $1
        WHERE id = $2
        RETURNING *
        `, [status, bookingId])
        return result.rows[0];
};

const setVehicleAvailability = async(vehicleId:number, status:'available' | 'booked')=>{
    await pool.query(`
        UPDATE vehicles SET availability_status = $1 WHERE id = $2
        `, [status, vehicleId])
};

export const bookingsServices = {
    CreateBookingInDb,
    getAllBookingsForAdminFromDb,
    getBookingsForCustomerFromDb,
    getBookingByIdFromDb,
    updateBookingStatusInDb,
    setVehicleAvailability
}