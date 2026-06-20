const express = require('express');
const cors = require('cors');
const startReservationCleanupJob = require("./Crons/ReservationsCleanupCron");
const EventRouter = require('./Routes/EventRoute');
const ReservationRouter = require('./Routes/ReservationRoute');
const BookingRouter = require('./Routes/BookingRoute');
const UserRouter = require('./Routes/UserRoute');

const app = express();

app.use(cors());

app.use(express.json());

startReservationCleanupJob();

app.use('/api/events', EventRouter);
app.use('/api/reserve', ReservationRouter);
app.use('/api/book', BookingRouter);
app.use('/api/users', UserRouter);

module.exports = app;