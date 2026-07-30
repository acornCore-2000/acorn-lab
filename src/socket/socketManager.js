import { io } from "socket.io-client";

let socket = null;

export function connectSocket() {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log(" Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}