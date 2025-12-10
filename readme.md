# 🚓 Vehicle Rental System - Backend Api

A backend REST Api for managing a vehicle rental system.
Built using **Node.js, Typescript, Express.js and postgreSQL** with **JWT-based authentication** and **role-based access control** .

---

## 🌐 Live URLs

**Live Deployments:**
https://

**GitHub Repository:**
https://

---

## ✨ Features

### 🔐 Authentication and authorization
- User SignUp and SignIn
- JWT-based authentication
- Role-based access (`admin`, `customer`) 

### 👤 User Management
- Admin can view all users
- Admin can update or delete any user
- Customer can update only own profile
- Users can not be deleted if they have active bookings

### 🚙 Vehicle Management
- Admin can create, update and delete vehicles
- Public can view all vehicles
- Vehicle can not be deleted if they have active bookings
- vehicle availability updates automatically

### 📅 Booking Management
- Customer and admin can create bookings
- Automatic total price calculation
- Customer can cancel bookings before start date
- Admin can mark booking as returned 
- Vehicle availability updates based on bookings status

---

### 🛠️ Technology Stack
- Node.js
- Typescript
- Express.js
- PostgreSQL
- JWT
- bcrypt.js
- dotenv
- pg
