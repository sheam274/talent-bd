import React from 'react';
import ReactDOM from 'react-dom/client';

/** * 1. STYLING ARCHITECTURE 
 * Hierarchical order to ensure CSS Variables are available to all components.
 */
import './index.css'; 
import './App.css'; 

// 2. CORE ENGINE
import App from './App';

/**
 * 3. MOBILE VIDEO PLAYER OPTIMIZATION
 * Fixes the "100vh" bug on mobile browsers (Safari/Chrome) where 
 * the address bar hides content. Used in App.css via height: calc(var(--vh, 1vh) * 100).
 */
const syncViewportHeight = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', syncViewportHeight);
syncViewportHeight();

/**
 * 4. MULTI-TAB WALLET SYNC
 * If a user earns XP or withdraws funds in Tab A, Tab B updates 
 * automatically to prevent double-spending or stale data.
 */
window.addEventListener('storage', (e) => {
  if (e.key === 'talentbd_v1') {
    // Graceful refresh to reload user state and wallet balances
    window.location.reload();
  }
});

/**
 * 5. RENDER ARCHITECTURE
 * Initializing React 18 Concurrent Root.
 * Optimized for HP-840 displays to manage concurrent rendering of 
 * the XP Bar + Video Player without dropping frames.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("❌ Critical: TalentBD root element not found. Check public/index.html");
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      {/* TALENTBD ECOSYSTEM 2026 
        ----------------------
        System Core: Auth, MFS (bKash/Nagad) Gateway, 
        and Learning Management.
      */}
      <App />
    </React.StrictMode>
  );
}

/**
 * 6. SYSTEM HEALTH MONITOR
 */
if (process.env.NODE_ENV === 'development') {
  console.log("🚀 TalentBD Engine: 2026 Stable | Concurrent Mode Active");
}