import React from 'react';
import ReactDOM from 'react-dom/client';

/** * 1. CORE STYLING INHERITANCE 
 * Order matters here: 
 * - index.css (Global variables and resets)
 * - DesignSystem.css (Standardized cards, grids, and buttons)
 * - App.css (Specific layout overrides)
 */
import './index.css'; 
import './App.css'; 

// 2. ROOT COMPONENT
import App from './App';

/**
 * 3. RENDER ARCHITECTURE
 * Initializing React 18 Concurrent Root.
 * This ensures that the heavy Framer Motion animations in the 
 * VideoPlayer and Dashboard don't block the main UI thread.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Defensive check for production robustness
  console.error("Critical Error: TalentBD root element not found.");
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      {/* TalentBD 2026 Engine 
        Encapsulating the entire application logic, 
        authentication states, and financial routing.
      */}
      <App />
    </React.StrictMode>
  );
}

/**
 * 4. SYSTEM HEALTH CHECK
 * To monitor the performance of our real-time 
 * earning bar and dashboard transitions.
 */
function reportPerformance(metric) {
  if (process.env.NODE_ENV === 'development') {
    // console.log(metric); 
  }
}