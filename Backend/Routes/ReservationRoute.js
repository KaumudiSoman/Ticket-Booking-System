const express = require("express");
const reservationController = require("../Controllers/ReservationController");
const authController = require('./../Controllers/AuthController');

const router = express.Router();

router.post("/", authController.protect, reservationController.reserveSeats);

module.exports = router;