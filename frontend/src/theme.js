/**
 * TalentBD Design System v2.0 (2026 Synchronized Edition)
 * Optimized for HP-840 Widescreen & Mobile High-DPI Displays.
 * This file serves as the Single Source of Truth for all styled-components or inline styles.
 */

export const theme = {
    colors: {
        // Brand Identity
        primary: '#2563eb',       
        primaryHover: '#1d4ed8',
        secondary: '#0f172a',     
        accent: '#10b981',        
        gold: '#f59e0b',          
        
        // Semantic Messaging
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',

        // Surfaces & Backgrounds
        bgMain: '#f8fafc',        
        bgCard: '#ffffff',
        bgDark: '#0f172a',
        border: '#e2e8f0',        
        
        // Transactional State Colors (Wallet Dashboard)
        cashIn: '#dcfce7',
        cashInText: '#166534',
        cashOut: '#fee2e2',
        cashOutText: '#991b1b',
        
        // Typography System
        textMain: '#1e293b',      
        textMuted: '#64748b',     
        textLight: '#f8fafc',
        textOnPrimary: '#ffffff',

        // Admin Infrastructure Palette
        admin: {
            surface: '#f1f5f9',
            border: '#cbd5e1',
            text: '#334155',
            action: '#0f172a',
            delete: '#fee2e2',
            deleteText: '#dc2626'
        }
    },

    // Spacing & Responsive Scaling
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        gap: 'clamp(16px, 3vw, 32px)', 
        containerPadding: 'clamp(1rem, 5vw, 2.5rem)',
        navHeight: '80px',
    },

    // UI Shape & Elevation
    borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px', 
        xl: '32px',
        round: '50%',
        pill: '100px'
    },

    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        premium: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', 
        glow: '0 0 20px rgba(37, 99, 235, 0.15)',        
        successGlow: '0 0 15px rgba(16, 185, 129, 0.2)',
        adminInner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
    },

    // Responsive Breakpoints
    breakpoints: {
        mobile: '480px',
        tablet: '768px',
        laptop: '1024px',
        desktop: '1280px', 
        widescreen: '1440px', 
    },

    // Responsive Typography Engine
    typography: {
        h1: 'clamp(2.25rem, 6vw, 3.5rem)',
        h2: 'clamp(1.5rem, 4vw, 2.25rem)',
        h3: 'clamp(1.2rem, 2vw, 1.5rem)',
        body: 'clamp(0.95rem, 1vw, 1.1rem)',
        label: '11px',
        weightNormal: '400',
        weightMedium: '600',
        weightBold: '800',
        weightBlack: '950', 
    },

    // Layer Management (Z-Index)
    zIndex: {
        base: 0,
        card: 10,
        sidebar: 40,
        nav: 50,
        earningBar: 60,
        modal: 100,
        tooltip: 110,
    },

    // Glassmorphism Definitions
    glass: {
        main: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
        },
        dark: {
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        }
    },

    // Industry Hub (Category Sidebar) Constants
    industryHub: {
        sidebarWidth: '280px',
        sidebarGap: '32px',
        itemHeight: '48px',
        activeIndicator: '#2563eb',
    },

    // Global Category & Taxonomy Tokens
    categories: {
        chipPadding: '8px 16px',
        chipGap: '10px',
        activeBg: '#2563eb',
        activeText: '#ffffff',
        inactiveBg: '#f1f5f9',
        inactiveText: '#64748b'
    },

    // Motion & Timing Functions
    transitions: {
        main: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
    },

    // Layout Utility Helpers
    layout: {
        grid: (minWidth = '320px') => ({
            display: 'grid',
            gap: 'clamp(16px, 3vw, 32px)',
            gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
        }),
        flexCenter: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        pageWrapper: {
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 24px'
        }
    }
};

export default theme;