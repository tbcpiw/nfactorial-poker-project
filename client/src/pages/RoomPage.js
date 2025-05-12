// client/src/pages/RoomPage.js
import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function RoomPage() {
  const { roomId } = useParams();
  const [players, setPlayers]     = useState([]);
  const [cards, setCards]         = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [playerName, setPlayerName]       = useState('');
  const [showModal, setShowModal]         = useState(true);
  const [tempName, setTempName]           = useState('');
  const [myId, setMyId]                   = useState(null);

  // Создаём единственный сокет-экземпляр
  const socketRef = useRef();
  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    const socket = socketRef.current;

    // Сохраняем свой socket.id
    socket.on('connect', () => {
      setMyId(socket.id);
    });

    // Слушаем обновления игроков
    socket.on('room_players', updatedPlayers => {
      setPlayers(updatedPlayers);
    });

    // Слушаем начало игры
    socket.on('game_started', ({ cards }) => {
      setCards(cards);
      setStatusMessage('Game has started!');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // После того как ввод имени подтверждён, один раз эмитим join и запрос списка
  useEffect(() => {
    const socket = socketRef.current;
    if (!playerName || !myId) return;

    socket.emit('join_room', { roomId, playerName });
    socket.emit('request_room_players', { roomId });
  }, [playerName, myId, roomId]);

  // Одноразовая отправка старта игры
  const handleStartGame = () => {
    socketRef.current.emit('start_game', { roomId });
  };

  // Сабмит модалки
  const handleNameSubmit = e => {
    e.preventDefault();
    const name = tempName.trim();
    if (name) {
      setPlayerName(name);
      setShowModal(false);
    }
  };

  // Находим свои карты по myId
  const myCards = cards.find(c => c.playerId === myId)?.cards || [];

  return (
    <div>
      {showModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>Enter your name</h3>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                autoFocus
                required
              />
              <button type="submit">Join</button>
            </form>
          </div>
        </div>
      )}

      {!showModal && (
        <>
          <h2>Room: {roomId}</h2>

          <h3>Players:</h3>
          <ul>
            {players.map(p => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>

          {!statusMessage && players[0]?.id === myId && (
            // Кнопка для хоста
            <button onClick={handleStartGame}>Start Game</button>
          )}

          {statusMessage && <p>{statusMessage}</p>}

          {myCards.length > 0 && (
            <div>
              <h3>Your Cards:</h3>
              <ul>
                {myCards.map((card, i) => (
                  <li key={i}>{card}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    textAlign: 'center',
  },
};

export default RoomPage;
