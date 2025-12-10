import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { bookingsServices } from "./bookings.service";

/* Make a bookings */
const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

        if (!req.user) {
            return res.status(401).send({
                success: false,
                message: 'Unauthorized',
                error: 'User not authenticated'
            })
        };

        if (!vehicle_id || !rent_start_date || !rent_end_date) {
            return res.status(400).json({
                success: false,
                message: 'validation error',
                error: 'vehicle_id, rent_start_date, rent_end_date are required'
            });
        };

        let finalCustomerId: number;

        if (req.user.role === 'admin') {
            if (!customer_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    error: 'customer_id is required'
                })
            }
            finalCustomerId = Number(customer_id)
        } else {
            finalCustomerId = req.user.id
        }

        /* Create bookings */
        const booking = await bookingsServices.CreateBookingInDb({
            customer_id: finalCustomerId,
            vehicle_id: Number(vehicle_id),
            rent_start_date,
            rent_end_date
        });
        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        })
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: 'Bad Request',
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
                    rent_end_date: b.rent_end_date,
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
                message: 'Your bookings retrieved successfully',
                data: bookings.map((b: any) => ({
                    id: b.id,
                    vehicle_id: b.vehicle_id,
                    rent_start_date: b.rent_start_date,
                    rent_end_date: b.rent_end_date,
                    total_price: b.total_price,
                    status: b.status,
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
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
};

const updateBookings = async (req: AuthRequest, res: Response) => {
    try {
        const bookingId = Number(req.params.bookingId);
        const { status } = req.body;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'User not authenticated'
            });
        }

        if (!status || !['cancelled', 'returned'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: 'status must be cancelled or returned'
            })
        };

        const booking = await bookingsServices.getBookingByIdFromDb(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            })
        };
        /* Only active booking can change */
        if (booking.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Bad Request',
                error: 'Only active bookings can be updated'
            })
        };

        /* booking cancellation by customer*/
        if (status === 'cancelled') {
            if (req.user.role !== 'customer') {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden',
                    error: 'Only customer can cancelled order'
                })
            };
            if (booking.customer_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden',
                    error: 'You can only cancel your own bookings'
                })
            };
            const today = new Date();
            if (new Date(booking.rent_start_date) <= today) {
                return res.status(400).json({
                    success: false,
                    message: 'booking can not be cancelled after start date'
                })
            };
        };


        if ( status === 'returned' && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin can only marked booking as returned'
            })
        };

        const updateBooking = await bookingsServices.updateBookingStatusInDb(
            bookingId,
            status
        );

        await bookingsServices.setVehicleAvailability(
            booking.vehicle_id,
            'available'
        );

        return res.status(200).json({
            success: true,
            message: status === 'returned' ? 'Booking marked as returned vehicle is now available' : 'Booking cancelled successfully',
            data: status === 'returned' ? {
                ...updateBooking,
                availability_status: 'available'
            } : updateBooking
        })
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        })
    }
};

export const bookingsController = {
    createBooking,
    getBookings,
    updateBookings
}