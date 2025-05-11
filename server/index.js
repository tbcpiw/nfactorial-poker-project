// server/index.js
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Server is running!');
});

let rooms = [];

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

  room.players.push('Player');
  res.json({ message: 'You have joined the room!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
