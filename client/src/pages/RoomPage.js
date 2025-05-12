import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

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

function RoomPage() {
  const { roomId } = useParams();

  // общие стейты
  const [players, setPlayers]             = useState([]);
  const [cards, setCards]                 = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [playerName, setPlayerName]       = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [tempName, setTempName]           = useState('');
  const [myId, setMyId]                   = useState(null);
  const [board, setBoard]                 = useState([]);


  // ставки
  const [pot, setPot]                         = useState(0);
  const [currentBet, setCurrentBet]           = useState(0);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [raiseAmount, setRaiseAmount]         = useState(0);

  // один сокет на компонент
  const socketRef = useRef();

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      setMyId(socket.id);
    });

    socket.on('room_players', updated => {
      setPlayers(updated);
    });

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

    socket.on('error_message', ({ message }) => {
      setStatusMessage(message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // после ввода имени — join + запрос списка
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
        setStatusMessage(`Winners: ${winners.map(w=>w.name).join(', ')}`);
      }
    });


    return () => {
      socket.off('flop');
      socket.off('turn');
      socket.off('river');
      socket.off('showdown');
    };
  }, []);


  // сабмит модалки
  const handleNameSubmit = e => {
    e.preventDefault();
    const name = tempName.trim();
    if (name) {
      setPlayerName(name);
      setShowModal(false);
    }
  };

  // определяем хоста
  const isHost = players[0]?.id === myId;

  // старт игры + инициализация pre-flop
  const handleStartGame = () => {
    const socket = socketRef.current;
    socket.emit('start_game', { roomId });
    socket.emit('init_preflop', { roomId });
  };

  // мои карты
  const myCards = cards.find(c => c.playerId === myId)?.cards || [];

  return (
    <div>
      {showModal
        ? (
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
        )
        : (
          <>
            <h2>Room: {roomId}</h2>
            <h3>Players:</h3>
            <ul>{players.map(p => <li key={p.id}>{p.name}</li>)}</ul>

            <div>
              <p>Pot: {pot}</p>
              <p>Current Bet: {currentBet}</p>
            </div>

            {!statusMessage && isHost && (
              <button onClick={handleStartGame}>Start Game</button>
            )}

            {statusMessage && <p>{statusMessage}</p>}

            {myCards.length > 0 && (
              <div>
                <h3>Your Cards:</h3>
                <ul>{myCards.map((c,i) => <li key={i}>{c}</li>)}</ul>
              </div>
            )}

            {/* Ставки */}
            {board.length > 0 && (
              <div>
                <h3>Board:</h3>
                <ul style={{ display: 'flex', gap: '0.5rem' }}>
                  {board.map((card, i) => <li key={i}>{card}</li>)}
                </ul>
              </div>
            )}

            {/* Кнопки фаз */}
            {isHost && statusMessage === 'Pre-flop started' && (
              <button onClick={() => socketRef.current.emit('deal_flop', { roomId })}>
                Deal Flop
              </button>
            )}
            {isHost && statusMessage === 'Flop dealt' && (
              <button onClick={() => socketRef.current.emit('deal_turn', { roomId })}>
                Deal Turn
              </button>
            )}
            {isHost && statusMessage === 'Turn dealt' && (
              <button onClick={() => socketRef.current.emit('deal_river', { roomId })}>
                Deal River
              </button>
            )}
            {isHost && statusMessage === 'River dealt' && (
              <button onClick={() => socketRef.current.emit('showdown', { roomId })}>
                Showdown
              </button>
            )}
          </>
        )
      }
    </div>
  );
}

export default RoomPage;
