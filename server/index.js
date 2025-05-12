import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app    = express();
const server = http.createServer(app);
const port   = 3001;

app.use(cors());
app.use(express.json());

let rooms = [];

app.get('/', (req, res) => res.send('Server running!'));

app.post('/create-room', (req, res) => {
  const { isPrivate, password } = req.body;
  const roomId = Math.random().toString(36).substr(2, 9);
  rooms.push({ roomId, isPrivate, password: isPrivate?password:null, players:[], gameStarted:false, cards:[] });
  res.json({ roomId });
});

app.get('/rooms', (req, res) => {
  res.json(rooms.filter(r => !r.isPrivate));
});

app.get('/room/:roomId', (req, res) => {
  const room = rooms.find(r => r.roomId === req.params.roomId);
  if (!room) return res.status(404).json({ message:'Room not found' });
  res.json(room);
});

app.post('/join-room', (req, res) => {
  const { roomId, password } = req.body;
  const room = rooms.find(r => r.roomId === roomId);
  if(!room) return res.status(404).json({ message:'Room not found' });
  if(room.isPrivate && room.password !== password) return res.status(403).json({ message:'Wrong password' });
  res.json({ message:'Joined!' });
});

const io = new Server(server, { cors:{ origin:'*' } });

io.on('connection', socket => {
  console.log('Conn:', socket.id);

  socket.on('join_room', ({ roomId, playerName }) => {
    const room = rooms.find(r=>r.roomId===roomId);
    if(!room) return;
    socket.join(roomId);
    const player = { id: socket.id, name: playerName };
    room.players.push(player);
    io.to(roomId).emit('room_players', room.players);
  });

  socket.on('request_room_players', ({ roomId }) => {
    const room = rooms.find(r=>r.roomId===roomId);
    if(room) io.to(roomId).emit('room_players', room.players);
  });

  socket.on('start_game', ({ roomId }) => {
    const room = rooms.find(r=>r.roomId===roomId);
    if(!room || room.players.length<2) {
      socket.emit('error_message', { message:'Need 2+ players' });
      return;
    }
    room.gameStarted = true;
    io.to(roomId).emit('game_started', { cards: room.cards });
  });

  socket.on('init_preflop', ({ roomId }) => {
    const room = rooms.find(r=>r.roomId===roomId);
    if(!room) return;
    const sb=5, bb=10;
    room.pot = sb+bb;
    room.currentBet = bb;
    room.players = room.players.map((p,i)=>({
      ...p,
      stack:1000-(i===1?sb:i===2?bb:0),
      contributed:i===1?sb:i===2?bb:0,
      folded:false
    }));
    room.currentPlayerIndex = 3 % room.players.length;
    io.to(roomId).emit('preflop_started', {
      players:room.players, pot:room.pot,
      currentBet:room.currentBet,
      currentPlayerId:room.players[room.currentPlayerIndex].id
    });
  });

  socket.on('player_action', ({ roomId, playerId, action, raiseAmount }) => {
    const room = rooms.find(r=>r.roomId===roomId);
    if(!room) return;
    const idx = room.players.findIndex(p=>p.id===playerId);
    if(idx<0 || room.players[idx].folded) return;
    const p = room.players[idx];
    switch(action) {
      case 'fold': p.folded=true; break;
      case 'check': if(p.contributed!==room.currentBet) return; break;
      case 'call': {
        const diff = room.currentBet - p.contributed;
        p.stack -= diff; p.contributed += diff; room.pot += diff;
      } break;
      case 'raise': {
        const total = raiseAmount + (room.currentBet - p.contributed);
        p.stack -= total; p.contributed += total; room.pot += total;
        room.currentBet += raiseAmount;
      } break;
      default: return;
    }
    // next player
    let next = (idx+1)%room.players.length;
    while(room.players[next].folded) next=(next+1)%room.players.length;
    room.currentPlayerIndex = next;
    io.to(roomId).emit('betting_update',{
      players:room.players, pot:room.pot,
      currentBet:room.currentBet,
      currentPlayerId:room.players[next].id
    });
  });

  socket.on('disconnect', () => {
    rooms.forEach(room=>{
      room.players = room.players.filter(p=>p.id!==socket.id);
      io.to(room.roomId).emit('room_players', room.players);
    });
  });
});

server.listen(port, ()=>console.log(`Listening ${port}`));
