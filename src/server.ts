import express from 'express'
import cors from 'cors'
import { authRoutes } from './modules/auth/auth.routes';
import { initDb } from './database/db';
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());


app.get('/', async (req, res) => {
    res.send('create a server')
});

app.use('/api/v1/auth', authRoutes);

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

