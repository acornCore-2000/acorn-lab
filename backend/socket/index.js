import { Server } from "socket.io";

let io;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });


  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);


    socket.on("join-post", (postId) => {
      socket.join(`post-${postId}`);

      console.log(
        socket.id,
        "joined",
        `post-${postId}`
      );
    });


    socket.on("leave-post", (postId) => {
      socket.leave(`post-${postId}`);

      console.log(
        socket.id,
        "left",
        `post-${postId}`
      );
    });


    socket.on("disconnect", (reason) => {
      console.log(
        "User disconnected:",
        socket.id,
        reason
      );
    });
  });


  return io;
}


export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized.");
  }

  return io;
}