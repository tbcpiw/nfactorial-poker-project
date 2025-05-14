// RoomPage.js
import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Card from '../components/Card';

function RoomPage() {
  const { roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [cards, setCards] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [playerName, setPlayerName] = useState(''); 
  const [showModal, setShowModal] = useState(true);
  const [tempName, setTempName] = useState('');
  const [myId, setMyId] = useState(null);
  const [board, setBoard] = useState([]);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);

  const socketRef = useRef();

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => setMyId(socket.id));

    socket.on('room_players', setPlayers);

    socket.on('preflop_started', ({ players, pot, currentBet, currentPlayerId }) => {
      setPlayers(players);
      setPot(pot);
      setCurrentBet(currentBet);
      setCurrentPlayerId(currentPlayerId);
      setStatusMessage('Pre-flop started');
    });

    socket.on('betting_update', ({ players, pot, currentBet, currentPlayerId }) => {
      setPlayers(players);
      setPot(pot);
      setCurrentBet(currentBet);
      setCurrentPlayerId(currentPlayerId);
    });

    socket.on('game_started', ({ cards }) => {
      setCards(cards);
      setStatusMessage('Game has started!');
    });

    socket.on('error_message', ({ message }) => setStatusMessage(message));

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    socket.on('chat_message', (message) => setMessages(prev => [...prev, message]));
    return () => socket.off('chat_message');
  }, []);

  useEffect(() => {
    const chatContainer = document.querySelector('[style*="height: 200px"]');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!playerName || !myId) return;
    socket.emit('join_room', { roomId, playerName });
    socket.emit('request_room_players', { roomId });
  }, [playerName, myId, roomId]);

  useEffect(() => {
    const socket = socketRef.current;
    socket.on('flop', ({ board, players, pot, currentBet, currentPlayerId }) => {
      setBoard(board);
      setPlayers(players);
      setPot(pot);
      setCurrentBet(currentBet);
      setCurrentPlayerId(currentPlayerId);
      setStatusMessage('Flop dealt');
    });
    socket.on('turn', ({ board, players, pot, currentBet, currentPlayerId }) => {
      setBoard(board);
      setPlayers(players);
      setPot(pot);
      setCurrentBet(currentBet);
      setCurrentPlayerId(currentPlayerId);
      setStatusMessage('Turn dealt');
    });
    socket.on('river', ({ board, players, pot, currentBet, currentPlayerId }) => {
      setBoard(board);
      setPlayers(players);
      setPot(pot);
      setCurrentBet(currentBet);
      setCurrentPlayerId(currentPlayerId);
      setStatusMessage('River dealt');
    });
    socket.on('showdown', ({ board, winners }) => {
      setBoard(board);
      if (winners.length === 1) {
        setStatusMessage(`Winner: ${winners[0].name}`);
      } else {
        setStatusMessage(`Winners: ${winners.map(w => w.name).join(', ')}`);
      }
    });

    return () => {
      socket.off('flop');
      socket.off('turn');
      socket.off('river');
      socket.off('showdown');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socketRef.current.emit('chat_message', {
      roomId,
      sender: playerName,
      text: newMessage
    });
    setNewMessage('');
  };

  const handleNameSubmit = e => {
    e.preventDefault();
    const name = tempName.trim();
    if (name) {
      setPlayerName(name);
      setShowModal(false);
    }
  };

  const isHost = players[0]?.id === myId;

  const handleStartGame = () => {
    const socket = socketRef.current;
    socket.emit('start_game', { roomId });
    socket.emit('init_preflop', { roomId });
  };

  const myCards = cards || [];

  return (
    <div>
      {showModal ? (
        <div>
          <h3>Enter your name</h3>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              required
              autoFocus
            />
            <button type="submit">Join</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Room: {roomId}</h2>
          <h3>Players:</h3>
          <ul>
            {players.map(p => <li key={p.id}>{p.name}</li>)}
          </ul>
          <p>Pot: {pot}</p>
          <p>Current Bet: {currentBet}</p>
          <div>
            {board.map((card, i) => (
              <Card key={i} value={card} style={{ backgroundColor: '#f5f5f5', color: '#000' }} />
            ))}
          </div>
          <div>
            {myCards.map((v, i) => (
              <Card key={i} value={v} style={{ backgroundColor: '#d0e6f6', color: '#000' }} />
            ))}
          </div>
          <div>
            {isHost && !statusMessage && <button onClick={handleStartGame}>Start Game</button>}
            {statusMessage && <p>{statusMessage}</p>}
            {isHost && statusMessage === 'Pre-flop started' && (
              <button onClick={() => socketRef.current.emit('deal_flop', { roomId })}>Deal Flop</button>
            )}
            {isHost && statusMessage === 'Flop dealt' && (
              <button onClick={() => socketRef.current.emit('deal_turn', { roomId })}>Deal Turn</button>
            )}
            {isHost && statusMessage === 'Turn dealt' && (
              <button onClick={() => socketRef.current.emit('deal_river', { roomId })}>Deal River</button>
            )}
            {isHost && statusMessage === 'River dealt' && (
              <button onClick={() => socketRef.current.emit('showdown', { roomId })}>Showdown</button>
            )}
          </div>
          <div>
            {messages.map((msg, i) => (
              <div key={i}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
            <form onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomPage;
