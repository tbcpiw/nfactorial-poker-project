const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const rooms = {}; // Example: { roomId1: [player1, player2], roomId2: [] }

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/create-room', (req, res) => {
  const roomId = Math.random().toString(36).substr(2, 6);
  rooms[roomId] = [];
  res.json({ roomId, message: 'Room created successfully' });
});

app.post('/join-room', (req, res) => {
  const { roomId } = req.body;

  if (!roomId || !rooms[roomId]) {
    return res.status(404).json({ message: 'Room not found' });
  }

  rooms[roomId].push(`player${rooms[roomId].length + 1}`);
  res.json({ message: `Joined room ${roomId}` });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
