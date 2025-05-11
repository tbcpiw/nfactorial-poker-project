// client/src/pages/RoomPage.jsx
import { useParams } from 'react-router-dom';

function RoomPage() {
  const { roomId } = useParams();

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <p>Waiting for players...</p>
      {/* In the future: list of players here */}
    </div>
  );
}

export default RoomPage;
