import React from 'react';
import ReactDOM from 'react-dom/client';

/**
 * 1. SYNCHRONIZED ARCHITECTURE
 * Imports global CSS for tailwind-style resets and the design tokens.
 */
import './index.css'; 
import { theme } from './theme';

// 2. CORE ENGINE
import App from './App';

/**
 * 3. 2026 MOBILE VIEWPORT FIX
 * Fixes the "100vh" issue on mobile browsers (Safari/Chrome address bars).
 * Access in CSS via: height: calc(var(--vh, 1vh) * 100);
 */
const syncViewportHeight = () => {
    if (typeof window !== 'undefined') {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncViewportHeight);
    window.addEventListener('orientationchange', syncViewportHeight);
    syncViewportHeight();
}

/**
 * 4. PERFORMANCE RENDER ARCHITECTURE
 * Initializing the React 18 Concurrent Root for low-latency UI updates.
 */
const rootElement = document.getElementById('root');

// Styling defined here to ensure it's available during the first paint
const globalWrapperStyle = {
    minHeight: 'calc(var(--vh, 1vh) * 100)',
    width: '100%',
    backgroundColor: theme?.colors?.bgMain || '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    color: theme?.colors?.textMain || '#0f172a',
    fontFamily: theme?.typography?.primary || 'Inter, sans-serif'
};

if (!rootElement) {
    console.error("❌ Critical: 'root' element missing in public/index.html.");
} else {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <React.StrictMode>
            <div 
                className="talentbd-global-wrapper" 
                style={globalWrapperStyle}
            >
                <App />
            </div>
        </React.StrictMode>
    );
}