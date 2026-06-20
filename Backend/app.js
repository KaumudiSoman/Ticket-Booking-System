const express = require('express');
const cors = require('cors');
const EventRouter = require('./Routes/EventRoute');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/events', EventRouter);

module.exports = app;