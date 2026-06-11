import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// No StrictMode: combat auto-turns run from effects and must fire exactly once.
createRoot(document.getElementById('root')).render(<App />);
