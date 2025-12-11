import express from 'express'
import cors from 'cors'
// import { authRoutes } from './modules/auth/auth.routes';
import { initDb } from './database/db';
import { vehicleRoutes } from './modules/vehicles/vehicles.routes';
import { bookingsRoutes } from './modules/bookings/bookings.routes';
import { usersRoutes } from './modules/users/users.routes';
import { authRoutes } from './modules/auth/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());

/* initialize db */
initDb();

app.get('/', async (req, res) => {
    res.send('Vehicle api is running')
})

/* auth routes */
app.use('/api/v1/auth', authRoutes);

/* user routes */
app.use('/api/v1/users', usersRoutes)
/* vehicles route */
app.use('/api/v1/vehicles', vehicleRoutes);

/*Booking routes  */
app.use('/api/v1/bookings', bookingsRoutes);







export default  app 

