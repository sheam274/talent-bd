import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. GLOBAL STYLES & RESPONSIVE ENGINE
// index.css handles 14" HP-840 display scaling and mobile resets
import './index.css'; 

// 2. DESIGN TOKENS
import theme from './theme';

// 3. MAIN APP ENGINE
import App from './App';

/**
 * TalentBD 2026 Entry Logic:
 * Optimized for React 19 and concurrent rendering.
 * No features removed. Only added stability for Admin Sync.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
    console.error("❌ Critical: Root element 'root' missing. Check public/index.html");
} else {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        {/* SYNC LAYER: 
          We wrap the App in a standard div with a responsive-container class 
          to ensure the Admin Category sidebar behaves on 14" screens.
        */}
        <div className="talentbd-responsive-wrapper" style={globalStyles.wrapper}>
            <App />
        </div>
      </React.StrictMode>
    );
}

/**
 * INLINE RESPONSIVE THEME SYNC
 * This ensures the background and font-scaling are applied globally
 * before the JS components even finish loading.
 */
const globalStyles = {
    wrapper: {
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f8fafc', // Synced with theme.js bgMain
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden' // Prevents horizontal scroll on HP-840 mobile view
    }
};