import { json, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { UpdateUserInput, userServices } from "./users.service";


const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const user = await userServices.getAllUsersFromDb();

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


/* update user [admin or own profile]*/

const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        const { name, email, phone, role } = req.body;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'User not authenticated'
            })
        };

        /* Customers update of own profile*/
        if (req.user.role === 'customer' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden',
                error: 'You can change only your own profile'
            })
        };

        /* customer can to change role */
        if (req.user.role === 'customer' && role) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden',
                error: 'You are not allowed to change role'
            })
        };

        const existingUser = await userServices.getUserByIdFromDb(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        };

        const updateData: UpdateUserInput = {};

        if (name) {
            updateData.name = name
        };
        if (email) {
            const taken = await userServices.isEmailTakenByAnotherUser(email, userId);
            if (taken!) {
                return res.status(400).json({
                    success: false,
                    message: 'Bad request',
                    error: 'Email already exists'
                })
            };
            updateData.email = email
        };
        if (phone !== undefined) {
            const phoneNumber = Number(phone);
            if (Number.isNaN(phoneNumber)) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    error: 'phone must be a valid number'
                })
            };
            updateData.Phone = phoneNumber
        };

        if (role && req.user.role === 'admin') {
            updateData.role = role
        };

        if (
            updateData.name === undefined &&
            updateData.email === undefined &&
            updateData.Phone === undefined &&
            updateData.role === undefined
        ) {
            return res.status(400).send({
                success: false,
                message: 'Bad Request',
                error: 'No fields to update'
            })
        };

        const updatedUser = await userServices.updateUserInDb(userId, updateData);
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        })

    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: 'Bad Request',
            error: error.message
        })
    }
}