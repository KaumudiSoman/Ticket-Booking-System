import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../api.js";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents()
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h1>Events</h1>
      {events.length === 0 && <p>No events found.</p>}
      {events.map((event) => (
        <div className="card" key={event._id}>
          <h2>{event.name}</h2>
          <p>Venue: {event.venue}</p>
          <p>Date: {new Date(event.dateTime).toLocaleString()}</p>
          <p>Total Seats: {event.totalSeats}</p>
          <Link to={`/events/${event._id}`}>
            <button>View Seats & Book</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
