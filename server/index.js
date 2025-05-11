// server/index.js
const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());

let rooms = []; // Массив для хранения комнат

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Эндпоинт для создания комнаты
app.post('/create-room', (req, res) => {
  const roomId = Math.random().toString(36).substr(2, 9); // Генерация случайного ID комнаты
  rooms.push(roomId);
  res.json({ roomId });
});

// Эндпоинт для присоединения к комнате
app.post('/join-room', (req, res) => {
  const { roomId } = req.body; // Получаем roomId из тела запроса

  if (rooms.includes(roomId)) {
    // Если комната существует, присоединяем
    res.json({ message: 'You have joined the room!' });
  } else {
    // Если комната не существует, отправляем ошибку
    res.status(404).json({ message: 'Room not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
