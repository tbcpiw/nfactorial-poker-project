// client/src/pages/HomePage.jsx
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    const res = await fetch('http://localhost:3001/create-room', { method: 'POST' });
    const data = await res.json();
    navigate(`/room/${data.roomId}`);
  };

  const handleJoin = () => navigate('/join');

  return (
    <div>
      <h1>Poker Game</h1>
      <button onClick={handleCreateRoom}>Create Room</button>
      <button onClick={handleJoin}>Join Room</button>
      <button onClick={() => alert('Game guide coming soon')}>Help</button>
    </div>
  );
}

export default HomePage;
