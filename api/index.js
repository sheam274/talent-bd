import React from 'react';
import ReactDOM from 'react-dom/client';

/**
 * 1. SYNCHRONIZED ARCHITECTURE
 * index.css: Handles CSS variables and Tailwind-style base resets.
 * theme.js: Centralized design tokens (colors, spacing, typography). [cite: 383]
 */
import './index.css'; 
import { theme } from './theme';

// 2. CORE ENGINE
import App from './App';

/**
 * 3. 2026 MOBILE VIEWPORT FIX
 * Solves the 100vh mobile address bar issue to ensure components fit 
 * perfectly on every screen, especially for real-time tracking modules. [cite: 17, 255]
 */
const syncViewportHeight = () => {
    if (typeof window !== 'undefined') {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
};

// Listen for resize and orientation changes to maintain a stable UI
if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncViewportHeight);
    window.addEventListener('orientationchange', syncViewportHeight);
    syncViewportHeight();
}

/**
 * 4. PERFORMANCE RENDER ARCHITECTURE
 * Uses React 18 Concurrent Root for smooth animations of the XP bar 
 * and real-time location updates from Google Maps API. [cite: 200, 446]
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
    console.error("❌ Critical: 'root' element missing. Ensure <div id='root'></div> exists in public/index.html.");
} else {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <React.StrictMode>
            {/* TOP-LEVEL CONTAINER:
                Prevents background "flicker" and ensures a consistent 
                experience across Android devices (Minimum SDK: Android 8.0). [cite: 363]
            */}
            <div 
                className="talentbd-global-wrapper" 
                style={globalStyles.wrapper}
            >
                <App />
            </div>
        </React.StrictMode>
    );
}

/**
 * 5. SYSTEM STYLING
 * Bridge between theme.js and the physical rendering layer.
 * Values derived from the TalentBD Design System. [cite: 95, 383]
 */
const globalStyles = {
    wrapper: {
        // Uses the dynamic viewport height fix
        minHeight: 'calc(var(--vh, 1vh) * 100)',
        width: '100%',
        backgroundColor: theme?.colors?.bgMain || '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        // Smooth font rendering for high-density mobile screens
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        color: theme?.colors?.textMain || '#0f172a',
        fontFamily: theme?.typography?.primary || 'Inter, sans-serif'
    }
};