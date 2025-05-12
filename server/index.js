// server/index.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const port = 3001;

// CORS и JSON парсер
app.use(cors());
app.use(express.json());

let rooms = []; // сюда складываем комнаты

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Создание комнаты
app.post('/create-room', (req, res) => {
  const { isPrivate, password } = req.body;
  const roomId = Math.random().toString(36).substr(2, 9);
  const room = {
    roomId,
    isPrivate,
    password: isPrivate ? password : null,
    players: [],
    gameStarted: false,
    cards: [], // сюда позже заложим раздачу карт
  };
  rooms.push(room);
  res.json({ roomId });
});

// Получить все публичные комнаты
app.get('/rooms', (req, res) => {
  const publicRooms = rooms.filter(r => !r.isPrivate);
  res.json(publicRooms);
});

// Получить данные конкретной комнаты (список игроков, статус)
app.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find(r => r.roomId === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  res.json(room);
});

// Присоединиться к комнате (REST)
app.post('/join-room', (req, res) => {
  const { roomId, password } = req.body;
  const room = rooms.find(r => r.roomId === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  if (room.isPrivate && room.password !== password) {
    return res.status(403).json({ message: 'Incorrect password for private room' });
  }
  res.json({ message: 'You have joined the room!' });
});

// Старт игры (REST)
app.post('/start-game', (req, res) => {
  const { roomId } = req.body;
  const room = rooms.find(r => r.roomId === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  if (room.players.length < 2) {
    return res.status(400).json({ message: 'Not enough players to start the game' });
  }

  room.gameStarted = true;
  // Простейшая раздача — по две "карты" каждому
  room.cards = room.players.map((p, i) => ({
    playerId: p.id,
    cards: [`Card${2*i+1}`, `Card${2*i+2}`],
  }));

  // Уведомляем всех игроков комнаты через WebSocket
  io.to(roomId).emit('game_started', { cards: room.cards });

  res.json({ message: 'Game started successfully!' });
});

// Socket.IO настройка
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] },
});

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('start_game', ({ roomId }) => {
  console.log('[SERVER] start_game received for room', roomId);
  const room = rooms.find(r => r.roomId === roomId);
  if (!room) return;

  // генерируем карты (пример)
  const cardsData = room.players.map(p => ({
    playerId: p.id,
    cards: ['🂡', '🂢', '🂣'] // просто пример
  }));

  io.to(roomId).emit('game_started', { cards: cardsData });
  socket.on('game_started', ({ cards }) => {
  console.log('[CLIENT] game_started event, cards=', cards);
  setCards(cards);
  setStatusMessage('Game has started!');
});

});



  socket.on('request_room_players', ({ roomId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (room) {
      io.to(roomId).emit('room_players', room.players);
    }
  });


  // Когда клиент просит присоединиться через сокеты
  socket.on('join_room', ({ roomId, playerName }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return;

    socket.join(roomId);

    const player = { id: socket.id, name: playerName };
    room.players.push(player);

    // Всем в комнате отсылаем обновлённый список игроков
    io.to(roomId).emit('room_players', room.players);
  });

  socket.on('disconnect', () => {
    // Убираем игрока из всех комнат и обновляем списки
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
