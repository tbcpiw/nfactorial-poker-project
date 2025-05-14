// src/pages/HomePage.js
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './HomePage.css'; // Подключение кастомного CSS

function HomePage() {
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');

  const handleCreateRoom = async () => {
    const res = await fetch('http://localhost:3001/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isPrivate,
        password: isPrivate ? password : null,
      }),
    });

    const data = await res.json();
    navigate(`/room/${data.roomId}`);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">♣ Poker Game ♠</h1>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
        />
        Private Room
      </label>

      {isPrivate && (
        <input
          type="password"
          placeholder="Enter room password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      )}

      <div className="button-group">
        <button className="btn green" onClick={handleCreateRoom}>
          Create Room
        </button>
        <button className="btn" onClick={() => navigate('/join')}>
          Join Room
        </button>
        <button className="btn" onClick={() => navigate('/rules')}>
          How to Play
        </button>
      </div>
    </div>
  );
}

export default HomePage;
