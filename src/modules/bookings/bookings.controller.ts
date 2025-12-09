import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { bookingsServices } from "./bookings.service";

/* Make a bookings */
const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;
        if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
            return res.status(400).json({
                success: false,
                message: 'validation error',
                error: 'customer_id, vehicle_id, rent_start_date, rent_end_date are required'
            });
        };
        /* Create bookings */
        const booking = await bookingsServices.CreateBookingInDb({
            customer_id: Number(customer_id),
            vehicle_id: Number(vehicle_id),
            rent_start_date,
            rent_end_date
        });
        return res.status(201).json({
            success: true,
            message: 'message created successfully',
            data: booking
        })
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: 'Bad request',
            error: error.message
        })
    }
};

/* Get bookings */
const getBookings = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'User not authenticated'
            });
        };
        if (req.user.role === 'admin') {
            const bookings = await bookingsServices.getAllBookingsForAdminFromDb();
            return res.status(200).json({
                success: true,
                message: 'Bookings retrieved successfully',
                data: bookings.map((b => ({
                    id: b.id,
                    customer_id: b.customer_id,
                    vehicle_id: b.vehicle_id,
                    rent_start_date: b.rent_start_date,
                    rent_end_date: b.ren_end_date,
                    total_price: b.total_price,
                    status: b.status,
                    customer: {
                        name: b.customer_name,
                        email: b.customer_email
                    },
                    vehicle: {
                        vehicle_name: b.vehicle_name,
                        registration_number: b.registration_number
                    },
                })))
            })
        } else {
            const bookings = await bookingsServices.getBookingsForCustomerFromDb(req.user.id);
            return res.status(200).json({
                success: true,
                message: 'your booking retrieved successfully',
                data: bookings.map((b) => ({
                    id: b.id,
                    vehicle_id: b.vehicle_id,
                    rent_start_date: b.rent_start_date,
                    rent_end_date: b.rent_end_date,
                    total_price: b.total_price,
                    vehicle: {
                        vehicle_name: b.vehicle_name,
                        registration_number: b.registration_number,
                        type: b.type
                    }
                }))
            })
        }
    } catch (error: any) {
        return res.status(500).json({
            success:false,
            message:'Internal server error',
            error: error.message
        })
    }
}