
import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';

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

const EMOJIS = [
  '🦄', // unicorn
  '🫠', // melting face
  '😂', // laughing
  '👩‍❤️‍👨', // couple
  '👩‍❤️‍👩', // couple
  '💖', // sparkling heart
  '💕', // two hearts
  '🌸', // cherry blossom
  '🥰', // smiling face with hearts
  '😍', // heart eyes
  '💐', // bouquet
  '🌈', // rainbow
  '✨', // sparkles
  '🎉', // party popper
  '🎈', // balloon
  '🍰', // cake
  '🍓', // strawberry

];

function Heart({ x, size, duration, id, onEnd, emoji }) {
  return (
    <span
      className="floating-heart"
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
  const [hearts, setHearts] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const nextId = useRef(0);
  const clickDocRef = useRef(doc(db, 'counters', 'clicks'));

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Firestore click count listener
  useEffect(() => {
    // Ensure the doc exists
    getDoc(clickDocRef.current).then((snap) => {
      if (!snap.exists()) {
        setDoc(clickDocRef.current, { count: 0 });
      }
    });
    // Listen for real-time updates
    const unsub = onSnapshot(clickDocRef.current, (docSnap) => {
      if (docSnap.exists()) {
        setClickCount(docSnap.data().count || 0);
      }
    });
    return () => unsub();
  }, []);

  const handleScreenClick = async (e) => {
    // Place heart at random horizontal position (relative to viewport)
    const x = randomBetween(0.05, 0.95);
    const size = randomBetween(1.5, 2.5);
    const duration = randomBetween(1.8, 2.7);
    const id = nextId.current++;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setHearts((h) => [...h, { x, size, duration, id, emoji }]);
    // Increment click count in Firestore
    try {
      await updateDoc(clickDocRef.current, { count: increment(1) });
    } catch (err) {
      // If doc doesn't exist, create it
      await setDoc(clickDocRef.current, { count: 1 });
    }
  };

  const handleHeartEnd = (id) => {
    setHearts((h) => h.filter((heart) => heart.id !== id));
  };

  // Full-page wrapper for hearts
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
      }}
    >
      {/* Hearts float over everything */}
      {hearts.map((heart) => (
        <Heart key={heart.id} {...heart} onEnd={handleHeartEnd} />
      ))}
      {/* Centered countdown container, pointer-events none so click passes through */}
      <div
        className="countdown-container"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        {timeLeft ? (
          <>
            <div className="countdown-timer">
              <span>{timeLeft.days}d</span> :
              <span>{timeLeft.hours}h</span> :
              <span>{timeLeft.minutes}m</span> :
              <span>{timeLeft.seconds}s</span>
            </div>
            <h2>Until we see each other! 💖</h2>
            <h3>January 5, 2026</h3>
          </>
        ) : (
          <>
            <h1>Today is the day! 🎉</h1>
            <p>Glæder mig til at se dig 💖</p>
          </>
        )}
        <div className="click-counter" style={{marginTop: '2rem', fontSize: '1.2rem', color: '#ffd6f6'}}>
          <strong>{clickCount}</strong> times we thought of each other 💭
        </div>
      </div>
    </div>
  );
}

export default App
