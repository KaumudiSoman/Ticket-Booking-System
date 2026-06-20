import { getToken } from "./auth.js";

const BASE_URL = "http://localhost:3000/api";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok || data.status === "fail") {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function signup({ name, email, password }) {
  const res = await fetch(`${BASE_URL}/users/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function getEvents() {
  const res = await fetch(`${BASE_URL}/events`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getEventById(id) {
  const res = await fetch(`${BASE_URL}/events/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function reserveSeats({ eventId, seatNumbers, userId }) {
  const res = await fetch(`${BASE_URL}/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ eventId, seatNumbers, userId }),
  });
  return handleResponse(res);
}

export async function confirmBooking(reservationId) {
  const res = await fetch(`${BASE_URL}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ reservationId }),
  });
  return handleResponse(res);
}