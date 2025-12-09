import { Request, Response } from "express";
import { vehicleServices } from "./vehicles.service";


/* Create vehicle */
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
        });
    }
};

/* Get all vehicles */

const getAllVehicles = async (req: Request, res: Response) => {
    try {
        const vehicles = await vehicleServices.getAllVehiclesFromDb();
        if (!vehicles.length) {
            return res.status(200).json({
                success: true,
                message: 'No vehicle found',
                data: []
            });

        }
        return res.status(200).json({
            success: true,
            message: 'vehicles retrieved successfully',
            data: vehicles
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "internal server error",
            error: error.message
        })
    }
};

/* Get single vehicle */

const getVehicleById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.vehicleId);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Bad request',
                error: 'invalid vehicleId'
            })
        };

        const vehicle = await vehicleServices.getVehicleByIdFromDb(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'vehicle not found'
            })
        };
        return res.status(200).json({
            success: true,
            message: 'Vehicle retrieved successfully',
            data: vehicle
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'internal server error',
            error: error.message
        })
    }
};

/* update single vehicle */
const updateVehicle = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.vehicleId);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Bad request',
                error: 'invalid vehicleId'
            })
        };

        const updated = await vehicleServices.UpdateVehicleInDb(id, req.body);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'vehicle not found'
            })
        };

        return res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: updated
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'internal server error',
            error: error.message
        })
    }
};

/* Delete vehicle */

const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.vehicleId);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Bad request',
                error: 'invalid vehicleId'
            })
        };

        const hasActive = await vehicleServices.vehicleHasActiveBookings(id);
        if (hasActive) {
            return res.status(400).json({
                success: false,
                message: 'Bad Request',
                errors: 'Vehicle can not be deleted when active bookings'
            })
        };

        const deletedCount = await vehicleServices.deleteVehicleFromDb(id);
        if (!deletedCount) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            })
        };

        return res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'internal server error',
            error: error.message
        })
    }
};

export const vehicleController = {
    createVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
}