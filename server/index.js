// index.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const port = 3001;

app.use(cors());
app.use(express.json());

let rooms = [];

const generateDeck = () => {
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['H', 'D', 'C', 'S'];
  return suits.flatMap(suit => values.map(value => `${value}${suit}`));
};

const shuffle = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

app.post('/create-room', (req, res) => {
  const { isPrivate, password } = req.body;
  const deck = shuffle(generateDeck());

  const newRoom = {
    roomId: Math.random().toString(36).substr(2, 9),
    isPrivate,
    password: isPrivate ? password : null,
    players: [],
    gameStarted: false,
    deck,
    communityCards: [],
    pot: 0,
    currentBet: 0,
    currentPlayerIndex: 0,
  };

  rooms.push(newRoom);
  res.json({ roomId: newRoom.roomId });
});

app.get('/rooms', (req, res) => {
  res.json(rooms.filter(r => !r.isPrivate));
});

app.post('/join-room', (req, res) => {
  const { roomId, password } = req.body;
  const room = rooms.find(r => r.roomId === roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (room.isPrivate && room.password !== password) return res.status(403).json({ message: 'Wrong password' });
  res.json({ message: 'Joined!' });
});

const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', socket => {
  console.log('Conn:', socket.id);

  socket.on('reconnect', ({ roomId, playerId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (room) {
      socket.join(roomId);
      room.players = room.players.map(p =>
        p.id === playerId ? { ...p, id: socket.id } : p
      );
    }
  });

  socket.on('join_room', ({ roomId, playerName }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return;
    socket.join(roomId);
    const player = { id: socket.id, name: playerName };
    if (!room.players.find(p => p.id === socket.id)) {
      room.players.push(player);
    }
    io.to(roomId).emit('room_players', room.players);
  });

  socket.on('request_room_players', ({ roomId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (room) io.to(roomId).emit('room_players', room.players);
  });

  socket.on('start_game', ({ roomId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room || room.players.length < 2) {
      socket.emit('error_message', { message: 'Need 2+ players' });
      return;
    }
    room.deck = shuffle(generateDeck());
    room.players.forEach(p => p.cards = [room.deck.pop(), room.deck.pop()]);
    room.communityCards = [];
    room.gameStarted = true;
    room.players.forEach(p => {
      io.to(p.id).emit('game_started', { cards: p.cards });
    });
  });

  socket.on('init_preflop', ({ roomId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return;
    const sb = 5, bb = 10;
    const [dealer, sbPlayer, bbPlayer] = room.players;

    room.pot = sb + bb;
    room.currentBet = bb;

    room.players = room.players.map((p, i) => {
      let stack = 1000, contributed = 0;
      if (p.id === sbPlayer.id) { stack -= sb; contributed = sb; }
      if (p.id === bbPlayer.id) { stack -= bb; contributed = bb; }
      return { ...p, stack, contributed, folded: false };
    });
    room.currentPlayerIndex = 3 % room.players.length;
    io.to(roomId).emit('preflop_started', {
      players: room.players,
      pot: room.pot,
      currentBet: room.currentBet,
      currentPlayerId: room.players[room.currentPlayerIndex].id
    });
  });

  socket.on('deal_flop', ({ roomId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return;
    room.communityCards.push(room.deck.pop(), room.deck.pop(), room.deck.pop());
    io.to(roomId).emit('flop', {
      board: room.communityCards,
      players: room.players,
      pot: room.pot,
      currentBet: room.currentBet,
      currentPlayerId: room.players[room.currentPlayerIndex].id
    });
  });

  socket.on('deal_turn', ({ roomId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return;
    room.communityCards.push(room.deck.pop());
    io.to(roomId).emit('turn', {
      board: room.communityCards,
      players: room.players,
      pot: room.pot,
      currentBet: room.currentBet,
      currentPlayerId: room.players[room.currentPlayerIndex].id
    });
  });

  socket.on('deal_river', ({ roomId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return;
    room.communityCards.push(room.deck.pop());
    io.to(roomId).emit('river', {
      board: room.communityCards,
      players: room.players,
      pot: room.pot,
      currentBet: room.currentBet,
      currentPlayerId: room.players[room.currentPlayerIndex].id
    });
  });

  socket.on('showdown', ({ roomId }) => {
    const room = rooms.find(r => r.roomId === roomId);
    if (!room) return;
    const winners = room.players.filter(p => !p.folded); // простая логика
    io.to(roomId).emit('showdown', { board: room.communityCards, winners });
  });

  socket.on('chat_message', ({ roomId, sender, text }) => {
    io.to(roomId).emit('chat_message', { sender, text });
  });

  socket.on('disconnect', () => {
    rooms.forEach(room => {
      room.players = room.players.filter(p => p.id !== socket.id);
      io.to(room.roomId).emit('room_players', room.players);
    });
  });
});

server.listen(port, () => console.log(`Listening ${port}`));
