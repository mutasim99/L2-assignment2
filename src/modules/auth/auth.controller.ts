import { Request, Response } from "express";
import { authServices } from "./auth.service";


const logInUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'validation error',
                error: 'email and password are required '
            });
        };

        const result = await authServices.loginUserIntoDb(email, password);
        const { password: pw, ...safeUser } = result.user;

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token: result.token,
                user: safeUser
            }
        });
    } catch (error: any) {
        if (error.message === 'invalid credentials' || error.message === 'invalid credentials!') {
            return res.status(401).json({
                success: false,
                message: 'unauthorized',
                errors: 'invalid email or password'
            });
        };
        return res.status(500).json({
            success: false,
            message: 'internal server error',
            errors: error.message
        });
    };

};

const signUpUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password || !phone === undefined) {
            return res.status(400).json({
                success:false,
                message:'validation error',
                errors:'name, email, password and phone are required'
            });
        };
        const phoneNumber = Number(phone);
        if (Number.isNaN(phoneNumber)) {
            return res.status(400).json({
                success:false,
                message:'validation error',
                errors:'phone must be a valid number'
            })
        };
        
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: 'Bad request',
            errors: error.message
        })
    }
} 