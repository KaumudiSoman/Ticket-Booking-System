const mongoose = require("mongoose");
const Seat = require("../Models/SeatModel");
const Reservation = require("../Models/ReservationModel");

exports.reserveSeats = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId, seatNumbers, userId } = req.body;

    if (!eventId || !seatNumbers || seatNumbers.length === 0) {
      throw new Error("Invalid input");
    }

    const result = await Seat.updateMany(
      {
        eventId,
        seatNumber: { $in: seatNumbers },
        status: "available",
      },
      {
        $set: { status: "reserved" },
      },
      { session }
    );

    if (result.modifiedCount !== seatNumbers.length) {
      throw new Error("Some seats are unavailable");
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const reservation = await Reservation.create(
      [
        {
          userId,
          eventId,
          seatNumbers,
          expiresAt,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      message: "Seats reserved successfully",
      data: reservation[0],
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};