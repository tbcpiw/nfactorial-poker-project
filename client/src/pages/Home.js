import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const createRoom = () => {
    const id = Math.floor(100000 + Math.random() * 900000); // 6-значный ID
    navigate(`/room/${id}`);
  };

  const joinRoom = () => {
    if (roomId.trim() !== '') {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div>
      <h1>Welcome to Poker!</h1>
      <button onClick={createRoom}>Create room</button>
      <div>
        <input
          type="text"
          placeholder="Enter ID of the room"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={joinRoom}>Enter the room</button>
      </div>
    </div>
  );
}
