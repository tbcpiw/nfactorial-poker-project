// client/src/pages/RoomPage.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

function RoomPage() {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      const response = await fetch(`http://localhost:3001/room/${roomId}`);
      const data = await response.json();
      setRoomData(data); // Сохраняем данные комнаты
    };

    fetchRoomData();
  }, [roomId]);

  if (!roomData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <p>Players:</p>
      <ul>
        {roomData.players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>

      {/* Кнопка для начала игры */}
      <button onClick={() => console.log('Game Started')}>Start Game</button>
    </div>
  );
}

export default RoomPage;
