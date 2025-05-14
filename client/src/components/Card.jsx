const suitSymbols = {
  H: '♥',
  D: '♦',
  C: '♣',
  S: '♠'
};

const isRedSuit = (suit) => suit === 'H' || suit === 'D';

export default function Card({ value }) {
  if (!value) return null;

  const rank = value.slice(0, -1); // "10", "K", "A", ...
  const suit = value.slice(-1);   // "H", "D", "C", "S"
  const symbol = suitSymbols[suit] || '?';
  const color = isRedSuit(suit) ? 'red' : 'black';

  return (
    <div style={{
      border: '1px solid #333',
      borderRadius: '8px',
      width: '50px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      color,
      backgroundColor: 'white'
    }}>
      {rank}{symbol}
    </div>
  );
}
