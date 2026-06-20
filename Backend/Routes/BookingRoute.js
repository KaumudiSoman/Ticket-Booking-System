// routes/bookingRoutes.js
const express = require("express");
const bookingController = require("../Controllers/BookingController");

const router = express.Router();

router.post("/", bookingController.bookSeats);

module.exports = router;