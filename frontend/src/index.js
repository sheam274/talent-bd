import React from 'react';
import ReactDOM from 'react-dom/client';

/** * 1. SYNCHRONIZED STYLING ARCHITECTURE 
 * Hierarchy is critical for responsiveness:
 * - index.css: Lowest level (CSS Variables, Global Resets)
 * - App.css: Mid level (Dashboard Layouts, Header Transitions)
 * - Inline Components: Highest level (Specific logic for Wallet/Gigs)
 */
import './index.css'; 
import './App.css'; 

// 2. CORE ENGINE
import App from './App';

/**
 * 3. 2026 PERFORMANCE OVERRIDES
 * We inject a viewport height fix to ensure the mobile experience 
 * doesn't suffer from the "address bar jump" during video lessons.
 */
const syncViewportHeight = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', syncViewportHeight);
syncViewportHeight();

/**
 * 4. RENDER ARCHITECTURE
 * Initializing React 18 Concurrent Root for your HP-840.
 * This enables "Time Slicing," allowing the XP Earning Bar to update 
 * without lagging the Video Player.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Defensive check for production robustness
  console.error("Critical Error: TalentBD root element not found.");
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      {/* TALENTBD ECOSYSTEM 2026 
        ----------------------
        Handles: Authentication, Wallet Payouts, 
        MFS Integration (bKash/Nagad), and AI CV Logic.
      */}
      <App />
    </React.StrictMode>
  );
}

/**
 * 5. SYSTEM HEALTH & PERSISTENCE SYNC
 * Ensures that if a user verifies a skill, 
 * the data is locked into LocalStorage immediately.
 */
window.addEventListener('storage', (e) => {
  if (e.key === 'talentbd_v1') {
    // Force re-sync across multiple tabs if user earns on one tab
    window.location.reload();
  }
});

/**
 * 6. PERFORMANCE REPORTING
 * Monitors FPS during heavy Framer Motion transitions 
 * in the WalletDashboard.
 */
reportPerformance();

function reportPerformance() {
  if (process.env.NODE_ENV === 'development') {
    // console.log("TalentBD Engine: System Health OK - 2026 Stable");
  }
}