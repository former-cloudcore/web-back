import socketIo from 'socket.io';
import {handleMessagePosting} from "../services/chat.service";

const initSocket = (server) => {
    const io: socketIo.Server = new socketIo.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        rejectUnauthorized: false
    });
    io.on('connection', (socket: socketIo.Socket) => {
        console.log('New client connected!');

        socket.on('joinRoom', (chatId) => {
            socket.join(chatId);
            console.log(`A client joined the room: ${chatId}`);
        });

        socket.on('leaveRoom', (chatId) => {
            socket.leave(chatId);
            console.log(`A client left the room: ${chatId}`);
        });

        socket.on('sendMessage', async ({ message, chatId, token }) => {
            const newMessage = await handleMessagePosting(message, chatId, token);
            io.to(chatId).emit('message', newMessage);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected...');
        });
    });
}

export default initSocket;
