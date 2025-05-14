// client/src/components/Card.js
import React from 'react';
import './Card.css';

export default function Card({ value }) {
  // Определяем цвет масти по символу
  const suit = value.slice(-1);
  const isRed = suit === '♥' || suit === '♦';
  return (
    <div className={`card ${isRed ? 'red' : 'black'}`}>
      <span className="card-value">{value}</span>
    </div>
  );
}

