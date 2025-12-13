import { Server as SocketServer, Socket } from "socket.io";
import server from "../index";
import * as Y from "yjs";
import { getYDoc } from "./yjs-store";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}
// This creates a socket server instance 
const io = new SocketServer(server, {
    cors: {
        origin: "*",
    },
});

const editor = io.of("/editor")


// Store user info per socket
const userMap = new Map<string, { username: string, roomId?: string }>();

editor.on("connection", (socket) => {
    console.log("A user is connected: ", socket.id);
    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
    });
    // Create a new room (accept username)

    socket.on("create-room", ({ username }) => {
        const roomId = generateRoomId();
        userMap.set(socket.id, { username, roomId });
        socket.join(roomId);
        socket.emit("room-created", {
            type: "success",
            event: "room-created",
            data: { roomId }
        });
        editor.to(roomId).emit("user-joined", {
            type: "info",
            event: "user-joined",
            data: { userId: socket.id, username }
        });
        console.log(`Room ${roomId} created by ${socket.id} (${username})`);
    });

    // Join an existing room (accept username)

    socket.on("join-room", ({ roomId, username }) => {
        const rooms = editor.adapter.rooms;
        if (rooms.has(roomId)) {
            userMap.set(socket.id, { username, roomId });
            socket.join(roomId);
            socket.emit("room-joined", {
                type: "success",
                event: "room-joined",
                data: { roomId }
            });
            editor.to(roomId).emit("user-joined", {
                type: "info",
                event: "user-joined",
                data: { userId: socket.id, username }
            });
            console.log(`${socket.id} (${username}) joined room ${roomId}`);
        } else {
            socket.emit("room-not-found", {
                type: "error",
                event: "room-not-found",
                error: "Room does not exist"
            });
            console.log(`${socket.id} tried to join invalid room ${roomId}`);
        }
    });

    // Broadcast message in the room

    socket.on("message", ({ roomId, text, user }) => {
        console.log(`Message in ${roomId} from ${user}: ${text}`);
        editor.to(roomId).emit("message", {
            type: "message",
            event: "message",
            data: {
                user,
                text,
                timestamp: Date.now(),
            }
        });
    });


    // Initial Yjs sync protocol (SyncStep1/2)
    socket.on("yjs-sync-step-1", ({ roomId, stateVector }) => {
        const ydoc = getYDoc(roomId);
        const update = Y.encodeStateAsUpdate(ydoc, new Uint8Array(stateVector));
        socket.emit("yjs-sync-step-2", update);
    });

    // Relay Yjs document updates (incremental)
    socket.on("yjs-update", ({ roomId, update }) => {
        const ydoc = getYDoc(roomId);
        Y.applyUpdate(ydoc, new Uint8Array(update));
        socket.to(roomId).emit("yjs-update", update);
    });

    // Relay Yjs awareness (cursor/presence) updates
    socket.on("yjs-awareness", ({ roomId, update }) => {
        console.log("yjs awareness docuemtns ....", update)
        if (roomId && update) {
            socket.to(roomId).emit("yjs-awareness", update);
        }
    });

    // Handle user disconnect
    socket.on("disconnecting", () => {
        const userInfo = userMap.get(socket.id);
        if (userInfo && userInfo.roomId) {
            editor.to(userInfo.roomId).emit("user-left", {
                type: "info",
                event: "user-left",
                data: { userId: socket.id, username: userInfo.username }
            });
        }
    });
    socket.on("disconnect", () => {
        userMap.delete(socket.id);
        console.log("User disconnected: ", socket.id);
    });
});






