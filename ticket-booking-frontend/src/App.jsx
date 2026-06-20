import React, { useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import EventsList from "./pages/EventsList.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import { isLoggedIn, getUser, clearAuth } from "./auth.js";

function RequireAuth({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    setLoggedIn(false);
    navigate("/login");
  }

  return (
    <div>
      <nav>
        <div>
          <Link to="/">Ticket Booking System</Link>
        </div>
        <div>
          {loggedIn ? (
            <>
              <span style={{ marginRight: 12, color: "var(--muted)" }}>
                {user?.name || user?.email}
              </span>
              <button onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: 12 }}>
                Log In
              </Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <EventsList />
            </RequireAuth>
          }
        />
        <Route
          path="/events/:id"
          element={
            <RequireAuth>
              <EventDetail />
            </RequireAuth>
          }
        />
        <Route path="/signup" element={<Signup onSignup={() => setLoggedIn(true)} />} />
        <Route path="/login" element={<Login onLogin={() => setLoggedIn(true)} />} />
      </Routes>
    </div>
  );
}