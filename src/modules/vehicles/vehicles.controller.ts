import { Request, Response } from "express";
import { vehicleServices } from "./vehicles.service";


const createVehicle = async (req: Request, res: Response) => {
    try {
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
        if (!vehicle_name || !type || !registration_number || daily_rent_price === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'validation error',
                errors: 'vehicle_name, type, registration_number and daily_rent_price are required'
            });
        };

        const created = await vehicleServices.createVehicleIntoDb({
            vehicle_name,
            type,
            registration_number,
            daily_rent_price: Number(daily_rent_price),
            availability_status
        });
        return res.status(201).json({
            success: true,
            message: 'vehicle created successfully',
            data: created
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'internal server error',
            error: error.message
        })
    }
}