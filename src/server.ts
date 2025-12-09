import express from 'express'
import cors from 'cors'
import { authRoutes } from './modules/auth/auth.routes';
import { initDb } from './database/db';
import { vehicleRoutes } from './modules/vehicles/vehicles.routes';
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());


/* user routes */
app.use('/api/v1/auth', authRoutes);

/* vehicles route */
app.use('/api/v1/vehicles', vehicleRoutes)

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

const startServer = async () => {
    try {
        await initDb();
        app.listen(port, ()=>{
            console.log(`server is running on port:${port}`);
            
        });
    } catch (error: any) {
        console.error('ERROR', error.message);
        process.exit(1);
    };
};

startServer();

export {app}

