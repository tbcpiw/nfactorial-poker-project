// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors()); // Разрешаем запросы с других портов, например с 3000
app.use(express.json());

let rooms = []; // Список комнат

// Проверка сервера
app.get('/', (req, res) => {
  res.send('Сервер работает!');
});

// Создание комнаты
app.post('/create-room', (req, res) => {
  const roomId = Math.random().toString(36).substr(2, 9);
  rooms.push(roomId);
  console.log(`Создана комната: ${roomId}`);
  res.json({ message: 'Комната создана!', roomId });
});

// Присоединение к комнате
app.post('/join-room', (req, res) => {
  const { roomId } = req.body;
  if (rooms.includes(roomId)) {
    console.log(`Присоединились к комнате: ${roomId}`);
    res.json({ message: 'Вы присоединились к комнате!', roomId });
  } else {
    res.status(404).json({ message: 'Комната не найдена' });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
