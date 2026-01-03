/**
 * TalentBD Design System v2.0
 * Unified theme for high-performance Fintech & Ed-Tech UI.
 */

export const theme = {
    colors: {
        // Brand Identity
        primary: '#2563eb',       // Trustworthy Blue
        primaryHover: '#1d4ed8',
        secondary: '#0f172a',     // Deep Slate/Navy
        accent: '#10b981',        // Success/Money Green
        gold: '#f59e0b',          // For XP/Leveling systems
        
        // Semantic Messaging
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',

        // Surfaces & Backgrounds
        bgMain: '#f8fafc',        
        bgCard: '#ffffff',
        bgDark: '#0f172a',
        border: '#e2e8f0',        // Standard border color
        
        // Typography System
        textMain: '#1e293b',      // Slate 800
        textMuted: '#64748b',     // Slate 500
        textLight: '#f8fafc',
        textOnPrimary: '#ffffff',
    },

    // Spacing (T-shirt sizes)
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        gap: 'clamp(16px, 3vw, 32px)', // Responsive gap
    },

    // UI Elevation
    borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '18px',
        xl: '28px',
        round: '50%',
    },

    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        premium: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', // For dashboard cards
        glow: '0 0 20px rgba(37, 99, 235, 0.15)',        // For "Verifying" states
    },

    // Responsive Breakpoints
    breakpoints: {
        mobile: '480px',
        tablet: '768px',
        laptop: '1024px',
        desktop: '1200px',
    },

    // Layer Management (Prevents z-index wars)
    zIndex: {
        base: 0,
        card: 10,
        nav: 50,
        earningBar: 60,
        modal: 100,
        tooltip: 110,
    },

    // Glassmorphism Utilities (2026 Trend)
    glass: {
        main: {
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        dark: {
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        }
    },

    transitions: {
        main: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
};

export default theme;