
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { db } from '../firebase';
import { ref, onValue, runTransaction } from 'firebase/database';

const EMOJIS = [
  '💑', '👩‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨', '💏', '💖', '💕', '💓', '💞', '💘', '💝', '💗', '💟', '🥰', '😍', '😘', '🌹', '🌸', '💐', '🎉', '🎈', '🦄', '🦄'
];

function getTimeLeft() {
  const target = new Date('2026-01-06T01:00:00');
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

function Particle({ x, y, size, duration, id, onEnd, emoji, turbulence }) {
  return (
    <span
      className={`floating-heart ${turbulence}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
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

  const handleScreenClick = (e) => {
    // Add floating emoji particle at click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = randomBetween(1.5, 4.5);
    const duration = randomBetween(2.8, 4.2);
    const id = nextId.current++;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const turbulence = Math.random() > 0.5 ? 'turbulence-left' : 'turbulence-right';
    setParticles((h) => [...h, { x, y, size, duration, id, emoji, turbulence }]);
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
    >
      {/* Floating emoji particles */}
      {particles.map((p) => (
        <Particle key={p.id} {...p} onEnd={handleParticleEnd} />
      ))}
      {/* Centered countdown and click counter */}
      <div
        className="countdown-container"
      >
        {timeLeft ? (
          <>
            <div className="countdown-timer">
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
        <div className="click-counter">
          <strong>Click anywhere</strong> to send a loving thought!<br />
          <strong>{clickCount}</strong> times we though of eachother 💭
        </div>
      </div>
    </div>
  );
}

export default App
