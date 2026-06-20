const BASE_URL = "http://localhost:3000/api";

// No login system in this project. We just generate a random "guest" ID
// once per browser and reuse it, so the backend's userId field has
// something to store. This is NOT real authentication.
//
// The backend's Reservation model defines userId as a Mongoose ObjectId,
// so it must be a 24-character hex string or Mongoose will reject it
// with a "Cast to ObjectId failed" error. We generate a random one here.
function generateObjectIdLike() {
  const hex = "0123456789abcdef";
  let id = "";
  for (let i = 0; i < 24; i++) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

export function getGuestUserId() {
  let id = localStorage.getItem("guestUserId");
  if (!id || !/^[0-9a-f]{24}$/.test(id)) {
    id = generateObjectIdLike();
    localStorage.setItem("guestUserId", id);
  }
  return id;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export async function getEvents() {
  const res = await fetch(`${BASE_URL}/events`);
  return handleResponse(res);
}

export async function getEventById(id) {
  const res = await fetch(`${BASE_URL}/events/${id}`);
  return handleResponse(res);
}

export async function reserveSeats({ eventId, seatNumbers, userId }) {
  const res = await fetch(`${BASE_URL}/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, seatNumbers, userId }),
  });
  return handleResponse(res);
}

export async function confirmBooking(reservationId) {
  const res = await fetch(`${BASE_URL}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reservationId }),
  });
  return handleResponse(res);
}