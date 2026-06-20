const Event = require("../Models/EventModel");
const Seat = require("../Models/SeatModel");

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ dateTime: 1 });

    res.status(200).json({
      status: "success",
      data: events,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        status: "fail",
        message: "Event not found",
      });
    }
    
    const seats = await Seat.find({ eventId: id });

    res.status(200).json({
      status: "success",
      data: {
        event,
        seats,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};