import { useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');

  const createRoom = async () => {
    try {
      const res = await fetch('http://localhost:3001/create-room', {
        method: 'POST',
      });
      const data = await res.json();
      setRoomId(data.roomId);
      setMessage(data.message);
    } catch (err) {
      setMessage('Error creating room');
    }
  };

  const joinRoom = async () => {
    try {
      const res = await fetch('http://localhost:3001/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: inputRoomId }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Error joining room');
    }
  };

  return (
    <div>
      <h1>Welcome to Poker!</h1>

      <button onClick={createRoom}>Create Room</button>
      {roomId && <p>Room ID: {roomId}</p>}

      <input
        type="text"
        placeholder="Enter room ID"
        value={inputRoomId}
        onChange={(e) => setInputRoomId(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>

      <p>{message}</p>
    </div>
  );
}

export default App;
