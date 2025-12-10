import { Router } from "express";
import { auth, requiredRole } from "../../middlewares/auth.middleware";
import { userController } from "./users.controller";


const router = Router();

/* Get all users [Admin only] */
router.get(
    '/',
    auth,
    requiredRole(['admin']),
    userController.getAllUsers
);

/* Update user [admin or own profile] */
router.put(
    '/:userId',
    auth,
    requiredRole(['admin', 'customer']),
    userController.updateUser
);

/* Delete user [admin only] */
router.delete(
    '/:userId',
    auth,
    requiredRole(['admin']),
    userController.deleteUser
);

export const usersRoutes = router;