import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import EventsList from "./pages/EventsList.jsx";
import EventDetail from "./pages/EventDetail.jsx";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">All Events</Link>
      </nav>
      <Routes>
        <Route path="/" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />
      </Routes>
    </div>
  );
}
