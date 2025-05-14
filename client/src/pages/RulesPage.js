// client/src/pages/RulesPage.js
import { useNavigate } from 'react-router-dom';

export default function RulesPage() {
  const navigate = useNavigate();
  return (
    <div className="rules-container">
      <h1>Texas Hold'em Rules</h1>

      <section>
        <h2>Game Objective</h2>
        <p>
          Make the best 5-card poker hand using any combination of your two hole cards 
          and the five community cards.
        </p>
      </section>

      <section>
        <h2>Game Stages</h2>
        <ol>
          <li><strong>Pre-flop:</strong> Players receive two private cards.</li>
          <li><strong>Flop:</strong> First three community cards revealed.</li>
          <li><strong>Turn:</strong> Fourth community card revealed.</li>
          <li><strong>River:</strong> Fifth community card revealed.</li>
          <li><strong>Showdown:</strong> Remaining players compare hands.</li>
        </ol>
      </section>

      <section>
        <h2>Player Actions</h2>
        <ul>
          <li><strong>Fold:</strong> Discard cards and forfeit the round.</li>
          <li><strong>Check:</strong> Pass without betting (if no current bet).</li>
          <li><strong>Call:</strong> Match the current bet.</li>
          <li><strong>Raise:</strong> Increase the bet amount.</li>
        </ul>
      </section>

      <button onClick={() => navigate(-1)}>← Back</button>
    </div>
  );
}