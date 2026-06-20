const mongoose = require("mongoose");
const Seat = require("../Models/SeatModel");
const Reservation = require("../Models/ReservationModel");

exports.bookSeats = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reservationId } = req.body;

    const reservation = await Reservation.findById(reservationId).session(session);

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.expiresAt < new Date()) {
        await Seat.updateMany({
            eventId: reservation.eventId,
            seatNumber: { $in: reservation.seatNumbers },
            status: "reserved"
        }, {
            $set: { status: "available" }
        });
      throw new Error("Reservation expired");
    }

    const result = await Seat.updateMany(
      {
        eventId: reservation.eventId,
        seatNumber: { $in: reservation.seatNumbers },
        status: "reserved",
      },
      {
        $set: { status: "booked" },
      },
      { session }
    );

    if (result.modifiedCount !== reservation.seatNumbers.length) {
      throw new Error("Some seats are no longer available");
    }

    await Reservation.findByIdAndDelete(reservationId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      message: "Booking confirmed",
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