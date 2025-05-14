// client/src/pages/JoinPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinPage.css'; // Подключаем CSS

function JoinPage() {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await fetch('http://localhost:3001/rooms');
      const data = await response.json();
      setRooms(data);
    };
    fetchRooms();
  }, []);

  const handleJoinRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.message);
      } else {
        setStatusMessage(data.message);
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      setStatusMessage('Failed to connect to the server');
      console.error('Error:', error);
    }
  };

  return (
    <div className="join-container">
      <h2 className="join-title">Join a Room</h2>

      <h3 className="subheading">Public Rooms</h3>
      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room.roomId} className="room-item">
            {room.roomId} (Public)
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Enter Password (if private)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />

      <button onClick={handleJoinRoom} className="btn green">Join Room</button>
      <p className="status-message">{statusMessage}</p>
    </div>
  );
}

export default JoinPage;
