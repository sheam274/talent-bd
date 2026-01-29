import React from 'react';
import ReactDOM from 'react-dom/client';

/** * 1. STYLING ARCHITECTURE 
 * Variables must be loaded first to prevent "Flash of Unstyled Content" (FOUC).
 */
import './index.css'; 
import './App.css'; 

// 2. CORE ENGINE
import App from './App';

/**
 * 3. MOBILE VIDEO PLAYER & UI OPTIMIZATION
 * Solves the "Real 100vh" problem on mobile browsers.
 * In your CSS, use: height: calc(var(--vh, 1vh) * 100);
 */
const syncViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Debounced listener to prevent performance lag during orientation changes
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(syncViewportHeight, 150);
});
syncViewportHeight();

/**
 * 4. MULTI-TAB WALLET & STATE SYNC
 * Listens for changes in other tabs. If a user withdraws money 
 * or earns points elsewhere, this tab stays in sync.
 */
window.addEventListener('storage', (e) => {
  if (e.key === 'talentbd_v1') {
    // Only reload if the data actually changed to avoid loop
    window.location.reload();
  }
});

/**
 * 5. RENDER ARCHITECTURE & ERROR BOUNDARY HINT
 * React 18 Concurrent Root. 
 * Designed for low-latency updates in the Learning Hub.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Critical Failure Alert
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = "padding:20px; text-align:center; color:#ef4444; font-weight:800;";
  errorDiv.innerText = "CRITICAL: System Root Missing. Please contact TalentBD support.";
  document.body.appendChild(errorDiv);
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      {/* TALENTBD ECOSYSTEM 2026 
        Stable Build: v1.0.4-LTS
      */}
      <App />
    </React.StrictMode>
  );
}

/**
 * 6. PERFORMANCE & HEALTH MONITORING
 */
const reportWebVitals = (metric) => {
  if (process.env.NODE_ENV === 'development') {
    // console.log(metric); // Uncomment to debug layout shifts (CLS) or load times (LCP)
  }
};

if (process.env.NODE_ENV === 'development') {
  console.log(`
  %c 🚀 TALENTBD ENGINE ACTIVE %c 2026 STABLE %c
  `, 
  'background:#2563eb; color:#fff; font-weight:bold; padding:4px 8px; border-radius:4px 0 0 4px;',
  'background:#0f172a; color:#fff; font-weight:bold; padding:4px 8px; border-radius:0 4px 4px 0;',
  'background:transparent'
  );
}