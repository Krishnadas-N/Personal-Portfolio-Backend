import { Http2Server } from "http2";
import { Server, Socket } from "socket.io";

const io = new Server();

const connectSocket = (server: Http2Server) => {
  io.attach(server);
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');
    socket.on('message', (message: string) => {
      console.log('Received message:', message);
      const chatbotResponse = "Hello! I'm your chatbot.";
      socket.emit('response', chatbotResponse);
    });
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

export { connectSocket };
