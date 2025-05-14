//RoomPage.js
import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Card from '../components/Card';

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, 
    left: 0,
    width: '100vw', 
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#34495e', // Изменили фон
    padding: '2rem',
    borderRadius: '10px',
    textAlign: 'center',
    color: 'white', // Добавили цвет текста
    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
  },
};



function RoomPage() {
  const { roomId } = useParams();

  // общие стейты
  const [players, setPlayers]             = useState([]);
  const [cards, setCards]                 = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [playerName, setPlayerName]       = useState(''); 
  const [showModal, setShowModal]         = useState(true);
  const [tempName, setTempName]           = useState('');
  const [myId, setMyId]                   = useState(null);
  const [board, setBoard]                 = useState([]);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');


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

  useEffect(() => {
    const socket = socketRef.current;

    // Обработчик новых сообщений
    socket.on('chat_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('chat_message');
    };
  }, []);

  // Отправка сообщений
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

  useEffect(() => {
    const chatContainer = document.querySelector('[style*="height: 200px"]');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Логирование для отладки
    console.log('Current messages:', messages);
  }, [messages]);

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
  const myCards = players.find(p => p.id === myId)?.cards || [];
  

  return (
    <div>
      {showModal
        ? (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
              <h3 style={{ marginBottom: '1rem' }}>Enter your name</h3>
              <form onSubmit={handleNameSubmit}>
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  style={{
                    padding: '8px',
                    marginBottom: '1rem',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    color: '#333' // Цвет текста в инпуте
                  }}
                  autoFocus
                  required
                />
                <button 
                  style={{
                    background: '#27ae60',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  type="submit"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        )
        : (
          <>
            <div style={{ 
              maxWidth: '800px', 
              margin: '20px auto', 
              padding: '20px',
              background: '#34495e',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ textAlign: 'center' }}>Room: {roomId}</h2>
              
              {/* Игроки и статус игры */}
              <div style={{ margin: '20px 0', textAlign: 'center' }}>
                <h3>Players:</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {players.map(p => <li key={p.id}>{p.name}</li>)}
                </ul>
                
                <div>
                  <p>Pot: {pot}</p>
                  <p>Current Bet: {currentBet}</p>
                </div>
              </div>

              {/* Игровой стол */}
              <div style={{ 
                position: 'relative', 
                minHeight: '400px', 
                border: '2px dashed #7f8c8d',
                borderRadius: '10px',
                padding: '20px'
              }}>
                {/* Общие карты */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  {board.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      {board.map((card, i) => <Card key={i} value={card} />)}
                    </div>
                  )}
                </div>
                
                {/* Карты текущего игрока */}
                {myCards.length > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '20px', 
                    left: '50%', 
                    transform: 'translateX(-50%)'
                  }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {myCards.map((v,i) => <Card key={i} value={v} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* Кнопки управления и статус */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {!statusMessage && isHost && (
                  <button onClick={handleStartGame}>Start Game</button>
                )}

                {statusMessage && <p>{statusMessage}</p>}

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
              </div>
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
            
            
          </>
            
        )
        
      }
    </div>
  );
}

export default RoomPage;

