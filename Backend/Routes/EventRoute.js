const express = require("express");
const eventsController = require("../Controllers/EventController");
const authController = require('./../Controllers/AuthController');

const router = express.Router();

router.get("/", authController.protect, eventsController.getAllEvents);

router.get("/:id", authController.protect, eventsController.getEventById);

module.exports = router;