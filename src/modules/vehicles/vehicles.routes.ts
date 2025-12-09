import { Router } from "express";
import { auth, requiredRole } from "../../middlewares/auth.middleware";
import { vehicleController } from "./vehicles.controller";


const router = Router();

/*Create vehicle [Admin routes] */
router.post('/', auth, requiredRole(['admin']), vehicleController.createVehicle);

/* Get vehicles [Public routes]*/
router.get('/', vehicleController.getAllVehicles)
router.get('/:vehicleId', vehicleController.getVehicleById)

/* Update and delete vehicle [Admin routes]*/
router.put('/:vehicleId', auth, requiredRole(['admin']), vehicleController.updateVehicle)
router.delete('/:vehicleId', auth, requiredRole(['admin']), vehicleController.deleteVehicle);

export const vehicleRoutes = router;