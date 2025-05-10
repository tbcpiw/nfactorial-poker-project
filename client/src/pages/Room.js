import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function Room() {
  const { roomId } = useParams();

  useEffect(() => {
    socket.emit('join_room', roomId);

    socket.on('player_joined', (playerId) => {
      console.log(`Игрок присоединился: ${playerId}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div>
      <h1>Вы в комнате: {roomId}</h1>
    </div>
  );
}
