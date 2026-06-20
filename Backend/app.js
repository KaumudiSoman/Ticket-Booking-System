const express = require('express');
const cors = require('cors');
const EventRouter = require('./Routes/EventRoute');
const ReservationRouter = require('./Routes/ReservationRoute');
const BookingRouter = require('./Routes/BookingRoute');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/events', EventRouter);
app.use('/api/reserve', ReservationRouter);
app.use('/api/book', BookingRouter);

module.exports = app;