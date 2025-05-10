import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Проверка соединения...');
  const [roomStatus, setRoomStatus] = useState('');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001')
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => {
        setMessage('Ошибка подключения к серверу');
        console.error('Ошибка:', err);
      });
  }, []);

  // Создание комнаты
  const createRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setRoomId(data.roomId);
      setRoomStatus(data.message + ' ID комнаты: ' + data.roomId);
    } catch (err) {
      setRoomStatus('Ошибка при создании комнаты');
      console.error(err);
    }
  };

  // Присоединение к комнате
  const joinRoom = async () => {
    if (!roomId) {
      setRoomStatus('Введите ID комнаты для присоединения!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      const data = await response.json();
      setRoomStatus(data.message);
    } catch (err) {
      setRoomStatus('Ошибка при присоединении к комнате');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Добро пожаловать в покер!</h1>
      <p>{message}</p>

      <div>
        <button onClick={createRoom}>Создать комнату</button>
        <button onClick={joinRoom}>Присоединиться к комнате</button>
      </div>

      <div>
        <input
          placeholder="Введите ID комнаты"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </div>

      <p>{roomStatus}</p>
    </div>
  );
}

export default App;
