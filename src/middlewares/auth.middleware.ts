import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export type UserRole = 'admin' | 'customer';

export interface JwtUser {
    id: number;
    email: string;
    role: UserRole
};

export interface AuthRequest extends Request {
    user?: JwtUser;
};

const secret = process.env.JWT_SECRET || 'secret_key';

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            error: 'Authorization headers missing or invalid'
        })
    };
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token!, secret) as JwtUser;
        req.user = decoded;
        next();
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            errors: 'invalid or expire token'
        })
    }
};

export const requiredRole = (roles: UserRole[] | any) => (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            error: 'user not authenticated'
        }) 
    };

    if (roles === 'any') {
        return next();
    };

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden',
            error: 'insufficient permission'
        }) 
    }
    next();
}