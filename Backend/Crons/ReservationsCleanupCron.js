const cron = require("node-cron");
const Reservation = require("../Models/ReservationModel");
const Seat = require("../Models/SeatModel");

const startReservationCleanupJob = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running reservation cleanup job...");

    const now = new Date();

    const expiredReservations = await Reservation.find({
      expiresAt: { $lt: now },
    });

    for (const reservation of expiredReservations) {
      await Seat.updateMany(
        {
          eventId: reservation.eventId,
          seatNumber: { $in: reservation.seatNumbers },
          status: "reserved",
        },
        { $set: { status: "available" } }
      );

      await Reservation.findByIdAndDelete(reservation._id);
    }
  });
};

module.exports = startReservationCleanupJob;