//HomePage.js
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function HomePage() {
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  

  const handleCreateRoom = async () => {
    const res = await fetch('http://localhost:3001/create-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isPrivate,
        password: isPrivate ? password : null,
      }),
    });

    const data = await res.json();
    navigate(`/room/${data.roomId}`);
  };

  const handleJoin = () => navigate('/join');

  return (
    <div>
      <h1>Poker Game</h1>

      <label>
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
        />
      )}

      <button onClick={handleCreateRoom}>Create Room</button>
      <button onClick={handleJoin}>Join Room</button>
      <button onClick={() => navigate('/rules')}>
        Правила игры
      </button>
    </div>
  );
}

export default HomePage;
