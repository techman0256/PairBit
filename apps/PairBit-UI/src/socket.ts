import { io, Socket } from "socket.io-client";


const socket: Socket = io("http://localhost:3000/editor", {
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
