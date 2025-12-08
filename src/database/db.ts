import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const pool = new Pool({
    connectionString: process.env.CONNECTION_STR
});

export const initDb = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone INT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN('admin', 'customer'))
        );

        CREATE TABLE IF NOT EXISTS vehicles(
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(150) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN('car', 'bike', 'van','SUV')),
        registration_number VARCHAR(250) UNIQUE NOT NULL,
        daily_rent_price INT NOT NULL CHECK (daily_rent_price > 0),
        availability_status VARCHAR(50) NOT NULL CHECK (availability_status IN ('available', 'booked'))
        );

        CREATE TABLE IF NOT EXISTS Bookings(
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL REFERENCES users(id),
        vehicle_id INT NOT NULL REFERENCES vehicles(id),
        rent_start_date DATE NOT NULL,
        rent_end_date DATE NOT NULL,
        total_price INT NOT NULL CHECK (total_price > 0) ,
        status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned'))
        )       
        `)
    console.log('database connected');

}