import { io, Socket } from "socket.io-client";



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const socket: Socket = io(`${API_BASE_URL}/editor`, {
  autoConnect: false,
});

// Debug connection
socket.on('connect', () => {
  console.log('Connected to /editor namespace:', socket.id);
});
socket.on('disconnecting', () => {
  console.log('disconencting to /editor namespace:', socket.id);
});
socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err);
});

export default socket;
