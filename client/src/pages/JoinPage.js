// client/src/pages/JoinPage.js
import { useState } from 'react';

function JoinPage() {
  const [roomId, setRoomId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleJoinRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }), // Отправляем roomId на сервер
      });

      if (!response.ok) {
        // Если сервер вернул ошибку (например, 404), выводим её
        const errorData = await response.json();
        setStatusMessage(errorData.message);
      } else {
        const data = await response.json();
        setStatusMessage(data.message);
      }
    } catch (error) {
      setStatusMessage('Failed to connect to the server');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Join a Room</h2>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoinRoom}>Join Room</button>
      <p>{statusMessage}</p>
    </div>
  );
}

export default JoinPage;
