import { Router } from "express";
import { auth, requiredRole } from "../../middlewares/auth.middleware";
import { bookingsController } from "./bookings.controller";


const router = Router();

/* post api for customer and admin */
router.post(
    '/',
    auth,
    requiredRole(['admin', 'customer']),
    bookingsController.createBooking
);

/* Get api for customer or admin */
router.get(
    '/',
    auth,
    requiredRole(['admin', 'customer']),
    bookingsController.getBookings
);

/* update booking */
router.put(
    '/:bookingId',
    auth,
    requiredRole(['admin', 'customer']),
    bookingsController.updateBookings
);

export const bookingsRoutes = router;