import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const port = 3001;

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
// server/index.js
app.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find(r => r.roomId === roomId);
  
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  res.json(room); // Отправляем данные комнаты (включая список игроков)
});


app.use(cors());
app.use(express.json());

let rooms = [];

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/create-room', (req, res) => {
  const { isPrivate, password } = req.body;
  const roomId = Math.random().toString(36).substr(2, 9);
  const room = {
    roomId,
    isPrivate,
    password: isPrivate ? password : null,
    players: [],
  };
  rooms.push(room);
  res.json({ roomId });
});

app.get('/rooms', (req, res) => {
  const publicRooms = rooms.filter(room => !room.isPrivate);
  res.json(publicRooms);
});

app.post('/join-room', (req, res) => {
  const { roomId, password } = req.body;
  const room = rooms.find(room => room.roomId === roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (room.isPrivate && room.password !== password)
    return res.status(403).json({ message: 'Incorrect password for private room' });
  res.json({ message: 'You have joined the room!' });
});

// Socket.io logic
io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId, playerName }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return;

    socket.join(roomId);

    const player = { id: socket.id, name: playerName };
    room.players.push(player);

    io.to(roomId).emit('room_players', room.players);
  });

  socket.on('disconnect', () => {
    for (const room of rooms) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(room.roomId).emit('room_players', room.players);
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
