const express = require("express");
const reservationController = require("../Controllers/ReservationController");

const router = express.Router();

router.post("/", reservationController.reserveSeats);

module.exports = router;