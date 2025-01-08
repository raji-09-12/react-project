import React from 'react';
import ReactDOM from 'react-dom/client';  // Updated import for React 18
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));  // Use createRoot

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
