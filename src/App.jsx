
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { db } from '../firebase';
import { ref, onValue, runTransaction } from 'firebase/database';

const EMOJIS = [
  '💑', '👩‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨', '💏', '💖', '💕', '💓', '💞', '💘', '💝', '💗', '💟', '🥰', '😍', '😘', '🌹', '🌸', '💐', '🎉', '🎈', '🦄', '🦄'
];

function getTimeLeft() {
  const target = new Date('2026-01-05T00:00:00');
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

function Particle({ x, size, duration, id, onEnd, emoji, turbulence }) {
  return (
    <span
      className={`floating-heart ${turbulence}`}
      style={{
        left: `${x * 100}%`,
        fontSize: `${size}rem`,
        animationDuration: `${duration}s`,
      }}
      onAnimationEnd={() => onEnd(id)}
    >
      {emoji}
    </span>
  );
}

function App() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState([]);
  const nextId = useRef(0);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Realtime Database click counter
  useEffect(() => {
    const countRef = ref(db, 'universalClickCount');
    const unsub = onValue(countRef, (snap) => {
      setClickCount(snap.exists() ? snap.val() : 0);
    });
    return () => unsub();
  }, []);

  const handleScreenClick = () => {
    // Add floating emoji particle
    const x = randomBetween(0.05, 0.45);
    const size = randomBetween(1.5, 4.5);
    const duration = randomBetween(2.8, 4.2);
    const id = nextId.current++;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const turbulence = Math.random() > 0.5 ? 'turbulence-left' : 'turbulence-right';
    setParticles((h) => [...h, { x, size, duration, id, emoji, turbulence }]);
    // Increment click count in Firebase
    const countRef = ref(db, 'universalClickCount');
    runTransaction(countRef, (current) => (current || 0) + 1);
  };

  const handleParticleEnd = (id) => {
    setParticles((h) => h.filter((p) => p.id !== id));
  };

  return (
    <div
      className="hearts-fullpage-wrapper"
      onClick={handleScreenClick}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #23272f 0%, #181c20 100%)',
      }}
    >
      {/* Floating emoji particles */}
      {particles.map((p) => (
        <Particle key={p.id} {...p} onEnd={handleParticleEnd} />
      ))}
      {/* Centered countdown and click counter */}
      <div
        className="countdown-container"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          pointerEvents: 'none',
          background: 'rgba(35, 39, 47, 0.95)',
          borderRadius: '1.5rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 24px #000a',
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        {timeLeft ? (
          <>
            <div className="countdown-timer" style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#ffb6e6', margin: '1.5rem 0'}}>
              <span>{timeLeft.days}d</span> :
              <span>{timeLeft.hours}h</span> :
              <span>{timeLeft.minutes}m</span> :
              <span>{timeLeft.seconds}s</span>
            </div>
            <h2 style={{color: '#ffd6f6'}}>Until we meet! 💖</h2>
            <h3 style={{color: '#ffd6f6'}}>January 5, 2026</h3>
          </>
        ) : (
          <>
            <h1>It's the day! 🎉</h1>
          </>
        )}
        <div className="click-counter" style={{marginTop: '2rem', fontSize: '1.2rem', color: '#ffd6f6'}}>
          <strong>Click anywhere</strong> to send a loving thought!<br />
          <strong>{clickCount}</strong> times we though of eachother 💭
        </div>
      </div>
    </div>
  );
}

export default App
