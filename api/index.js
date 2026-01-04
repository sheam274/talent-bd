import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. Import Global Styles (Ensure index.css exists in src/)
import './index.css'; 

// 2. Import the Main App Engine
import App from './App';

/**
 * TalentBD - Main Entry Point
 * React.StrictMode is enabled to catch potential problems in development:
 * - It identifies components with unsafe lifecycles
 * - It warns about legacy API usage
 * - It detects unexpected side effects
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error("Failed to find the root element. Check your index.html.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* Wrap <App /> with Context Providers here in the future */}
    <App />
  </React.StrictMode>
);

/**
 * Optimization Note:
 * If you want to start measuring performance in your app, pass a function
 * to log results (for example: reportWebVitals(console.log))
 */