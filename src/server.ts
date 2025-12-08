import express from 'express'
import { initDb } from './database/db';
const app = express();
const port = 5000;

app.use(express.json());

app.get('/', async (req, res) => {
    res.send('create a server')
});
initDb()

app.listen(port, ()=>{
    console.log(`my server is running on port:${port}`);
    
})