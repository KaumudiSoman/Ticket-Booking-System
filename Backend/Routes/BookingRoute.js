const express = require("express");
const bookingController = require("../Controllers/BookingController");
const authController = require('./../Controllers/AuthController');

const router = express.Router();

router.post("/", authController.protect, bookingController.bookSeats);

module.exports = router;