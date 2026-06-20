# 🎟️ Ticket Booking System

A full-stack ticket booking application built with **Node.js / Express / MongoDB** on the backend and **React (Vite)** on the frontend. It supports user authentication, event browsing, seat reservation with a time-limited hold, and confirmed booking — all protected against race conditions and double-booking through MongoDB transactions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [How Race Conditions & Double Booking Are Prevented](#how-race-conditions--double-booking-are-prevented)

---

## Features

- User signup and login with JWT authentication
- Browse upcoming events and view seat availability in real time
- Reserve seats with a **10-minute time-limited hold**
- Confirm a reservation to complete the booking
- Automatic cleanup of expired reservations via a scheduled cron job
- All seat state transitions are atomic — safe under concurrent load

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Node.js, Express 5, Mongoose 9      |
| Database  | MongoDB (replica set required for transactions) |
| Frontend  | React 18, React Router v6, Vite 5   |
| Auth      | JSON Web Tokens (jsonwebtoken)      |
| Scheduler | node-cron                           |

---

## Project Structure

```
Ticket-Booking-System/
├── Backend/
│   ├── Controllers/
│   │   ├── AuthController.js        # Signup, login, JWT protect middleware
│   │   ├── BookingController.js     # Confirms a reservation → marks seats "booked"
│   │   ├── EventController.js       # List events, get event + seats by ID
│   │   └── ReservationController.js # Creates a time-limited seat hold
│   ├── Crons/
│   │   └── ReservationsCleanupCron.js  # Runs every minute to release expired holds
│   ├── Models/
│   │   ├── EventModel.js            # name, dateTime, venue, totalSeats
│   │   ├── ReservationModel.js      # userId, eventId, seatNumbers[], expiresAt
│   │   ├── SeatModel.js             # eventId, seatNumber, status (available/reserved/booked)
│   │   └── UserModel.js             # name, email, password
│   ├── Routes/
│   │   ├── BookingRoute.js
│   │   ├── EventRoute.js
│   │   ├── ReservationRoute.js
│   │   └── UserRoute.js
│   ├── app.js
│   ├── server.js
│   └── config.env                   # (you create this — see below)
└── ticket-booking-frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── EventsList.jsx
    │   │   └── EventDetail.jsx
    │   ├── App.jsx
    │   ├── api.js
    │   └── auth.js
    └── index.html
```

---

## Setup & Installation

### Prerequisites

- Node.js ≥ 18
- A MongoDB instance running as a **replica set** (required for multi-document transactions). A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works out of the box.

### 1. Clone the repository

```bash
git clone https://github.com/KaumudiSoman/Ticket-Booking-System.git
cd Ticket-Booking-System
```

### 2. Set up the Backend

```bash
cd Backend
npm install
```

Create a `config.env` file in the `Backend/` directory:

```env
DATABASE=mongodb://kaumudi814_db_user:<PASSWORD>@ac-6db4l2u-shard-00-00.re8x4lw.mongodb.net:27017,ac-6db4l2u-shard-00-01.re8x4lw.mongodb.net:27017,ac-6db4l2u-shard-00-02.re8x4lw.mongodb.net:27017/TicketBookingSys?ssl=true&replicaSet=atlas-pebqul-shard-0&authSource=admin&appName=Cluster0
DATABASE_PASSWORD=jd9nvE44LDwnqkv6

JWT_SECRET_KEY=mysecretkey
JWT_EXPIRES_IN=10d

PORT=3000
```

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

### 3. Set up the Frontend

```bash
cd ../ticket-booking-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

> **Note:** The frontend's `api.js` points to the backend base URL. If you change the backend port, update that file accordingly.

---

## Environment Variables

| Variable            | Description                                      |
|---------------------|--------------------------------------------------|
| `DATABASE`          | MongoDB connection string (with `<PASSWORD>` placeholder) |
| `DATABASE_PASSWORD` | Substituted into the connection string at runtime |
| `JWT_SECRET_KEY`    | Secret used to sign and verify JWTs             |
| `JWT_EXPIRES_IN`    | JWT validity duration (e.g. `7d`, `24h`)         |
| `PORT`              | Port the Express server listens on (default: 3000) |

---

## API Reference

All routes except `/api/users/signup` and `/api/users/login` require a `Bearer <token>` authorization header.

| Method | Endpoint            | Description                              |
|--------|---------------------|------------------------------------------|
| POST   | `/api/users/signup` | Register a new user                      |
| POST   | `/api/users/login`  | Log in, receive a JWT                    |
| GET    | `/api/events`       | List all events (sorted by date)         |
| GET    | `/api/events/:id`   | Get a single event and its seats         |
| POST   | `/api/reserve`      | Reserve seats (10-minute hold)           |
| POST   | `/api/book`         | Confirm a reservation → complete booking |

### Reserve seats — request body
```json
{
  "eventId": "<event ObjectId>",
  "seatNumbers": ["S1", "S2"],
  "userId": "<user ObjectId>"
}
```

### Confirm booking — request body
```json
{
  "reservationId": "<reservation ObjectId>"
}
```

---

## How Race Conditions & Double Booking Are Prevented

Each seat has three states: `available` → `reserved` → `booked`.

**Reservation** — When a user selects seats, the system conditionally updates only seats with status `available` inside a MongoDB transaction. If the number of seats updated doesn't match the number requested (because another user grabbed one simultaneously), the transaction aborts. A successful reservation holds the seats for **10 minutes**.

**Booking** — Confirming a reservation checks expiry first, then conditionally flips seats from `reserved` to `booked` in a transaction. On success, the reservation document is deleted. Any failure aborts the whole transaction — no partial bookings.

**Race conditions** — Because every seat update filters on the current status, two concurrent requests for the same seat cannot both succeed. MongoDB's document-level locking ensures only one write wins; the other fails cleanly.

**Expired reservation cleanup** — A cron job runs every minute, releases seats from expired reservations back to `available`, and deletes the reservation documents.

**Database safeguard** — A unique compound index on `(eventId, seatNumber)` prevents duplicate seat documents at the database level.