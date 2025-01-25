import { Http2Server } from "http2";
import { Server, Socket } from "socket.io";

const io = new Server();

const connectSocket = (server: Http2Server) => {
  io.attach(server);
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
  });
};

export { connectSocket };
