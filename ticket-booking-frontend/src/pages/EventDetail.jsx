import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getEventById,
  reserveSeats,
  confirmBooking,
} from "../api.js";
import { getUser } from "../auth.js";

function reservationKey(eventId) {
  return `reservation_${eventId}`;
}

function loadSavedReservation(eventId) {
  const raw = localStorage.getItem(reservationKey(eventId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(reservationKey(eventId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveReservation(eventId, reservation) {
  if (reservation) {
    localStorage.setItem(reservationKey(eventId), JSON.stringify(reservation));
  } else {
    localStorage.removeItem(reservationKey(eventId));
  }
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [reservation, setReservation] = useState(() => loadSavedReservation(id));
  const [secondsLeft, setSecondsLeft] = useState(0);

  function loadEvent() {
    setLoading(true);
    getEventById(id)
      .then((res) => {
        setEvent(res.data.event);
        setSeats(res.data.seats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEvent();
  }, [id]);

  useEffect(() => {
    if (!reservation) return;
    const interval = setInterval(() => {
      const diff = Math.floor(
        (new Date(reservation.expiresAt).getTime() - Date.now()) / 1000
      );
      setSecondsLeft(diff > 0 ? diff : 0);
      if (diff <= 0) {
        clearInterval(interval);
        setError("Reservation expired. Please select seats again.");
        setReservation(null);
        saveReservation(id, null);
        setSelectedSeats([]);
        loadEvent();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  useEffect(() => {
    if (reservation) return;
    const stillStale = seats.some((s) => s.status === "reserved");
    if (!stillStale) return;

    let attempts = 0;
    const poll = setInterval(() => {
      attempts += 1;
      loadEvent();
      if (attempts >= 12) clearInterval(poll);
    }, 5000);

    return () => clearInterval(poll);
  }, [reservation, seats]);

  function toggleSeat(seat) {
    if (seat.status !== "available" || reservation) return;
    setSelectedSeats((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((s) => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  }

  async function handleReserve() {
    setError("");
    setSuccess("");
    if (selectedSeats.length === 0) {
      setError("Select at least one seat first.");
      return;
    }
    try {
      const res = await reserveSeats({
        eventId: id,
        seatNumbers: selectedSeats,
        userId: getUser()._id,
      });
      setReservation(res.data);
      saveReservation(id, res.data);
      setSuccess("Seats reserved! Confirm within 10 minutes.");
      loadEvent();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirm() {
    setError("");
    setSuccess("");
    try {
      await confirmBooking(reservation._id);
      setSuccess("Booking confirmed! Enjoy the event.");
      setReservation(null);
      saveReservation(id, null);
      setSelectedSeats([]);
      loadEvent();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p className="error">{error || "Event not found"}</p>;

  return (
    <div>
      <Link to="/">&larr; Back to all events</Link>
      <h1>{event.name}</h1>
      <p>Venue: {event.venue}</p>
      <p>Date: {new Date(event.dateTime).toLocaleString()}</p>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <h2>Select Seats</h2>
      <div className="seat-area">
        <div className="stage">STAGE</div>
        <div className="seat-grid">
          {seats.map((seat) => {
            const isSelected =
              !reservation && selectedSeats.includes(seat.seatNumber);
            const cls = "seat " + (isSelected ? "selected" : seat.status);
            return (
              <div
                key={seat._id}
                className={cls}
                onClick={() => toggleSeat(seat)}
                title={seat.status}
              >
                {seat.seatNumber}
              </div>
            );
          })}
        </div>
      </div>

      <div className="legend">
        <span><span className="legend-swatch" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}></span>Available</span>
        <span><span className="legend-swatch" style={{ background: "#1d4d33", border: "1px solid #4ade80" }}></span>Selected</span>
        <span><span className="legend-swatch" style={{ background: "#5b4416", border: "1px solid #8a6a1f" }}></span>Reserved</span>
        <span><span className="legend-swatch" style={{ background: "#4a2222", border: "1px solid #7a3232" }}></span>Booked</span>
      </div>

      {!reservation && (
        <button onClick={handleReserve}>
          Reserve {selectedSeats.length || ""} Seat
          {selectedSeats.length === 1 ? "" : "s"}
        </button>
      )}

      {reservation && (
        <div className="card">
          <p>
            Seats reserved: <strong>{reservation.seatNumbers.join(", ")}</strong>
          </p>
          <p className="timer">Time left to confirm: {secondsLeft}s</p>
          <button onClick={handleConfirm}>Confirm Booking</button>
        </div>
      )}
    </div>
  );
}