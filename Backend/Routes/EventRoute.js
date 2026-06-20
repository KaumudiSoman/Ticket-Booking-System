const express = require("express");
const eventsController = require("../Controllers/EventController");

const router = express.Router();

router.get("/", eventsController.getAllEvents);

router.get("/:id", eventsController.getEventById);

module.exports = router;