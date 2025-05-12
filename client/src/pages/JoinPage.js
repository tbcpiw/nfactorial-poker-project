// client/src/pages/JoinPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function JoinPage() {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [rooms, setRooms] = useState([]); // Для хранения списка публичных комнат
  const navigate = useNavigate();

  // Получаем список публичных комнат с сервера
  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch('http://localhost:3001/rooms');
      const data = await response.json();
      setRooms(data); // Сохраняем публичные комнаты
    };

    fetchRooms();
  }, []);

  const handleJoinRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, password }), // Отправляем roomId и пароль
      });

      if (!response.ok) {
        const errorData = await response.json();
        setStatusMessage(errorData.message);
      } else {
        const data = await response.json();
        setStatusMessage(data.message);

        // Переходим на страницу комнаты
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      setStatusMessage('Failed to connect to the server');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Join a Room</h2>
      
      {/* Список публичных комнат */}
      <h3>Public Rooms:</h3>
      <ul>
        {rooms.map((room) => (
          <li key={room.roomId}>
            {room.roomId} (Public)
          </li>
        ))}
      </ul>

      {/* Форма для ввода Room ID и пароля (для приватных комнат) */}
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter Password (if private)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleJoinRoom}>Join Room</button>
      <p>{statusMessage}</p>
    </div>
  );
}

export default JoinPage;
