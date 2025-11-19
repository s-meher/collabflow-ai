import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

let socket: Socket | null = null;

export type AppSocket = Socket;

export function getSocket(): AppSocket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"], 
    });

    socket.on("connect", () => {
      console.log("[socket] connected", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("[socket] disconnected");
    });

    socket.on("connect_error", err => {
      console.error("[socket] connect_error", err.message);
    });
  }

  return socket;
}
