import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Suppress known benign console errors
const resizeObserverErr = window.console.error;
window.console.error = (...args) => {
  if (args[0]?.includes?.('ResizeObserver loop')) return;
  if (args[0]?.includes?.('message channel closed before a response was received')) return;
  resizeObserverErr(...args);
};

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes?.('message channel closed before a response was received')) {
    e.preventDefault();
  }
});

window.addEventListener('error', e => {
  if (e.message?.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

// Global URL normalization for hosted environments:
// rewrites hardcoded localhost backend URLs to configured backend origin.
const API_BASE_URL = process.env.REACT_APP_API_URL
  || (window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`);
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
const LOCAL_BACKEND_ORIGIN = 'http://localhost:5000';
const rewriteBackendUrl = (url) => {
  if (typeof url !== 'string') return url;
  if (!url.startsWith(LOCAL_BACKEND_ORIGIN)) return url;
  return `${BACKEND_ORIGIN}${url.slice(LOCAL_BACKEND_ORIGIN.length)}`;
};

const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  if (typeof input === 'string') {
    input = rewriteBackendUrl(input);
  } else if (input instanceof Request) {
    const rewrittenUrl = rewriteBackendUrl(input.url);
    if (rewrittenUrl !== input.url) {
      input = new Request(rewrittenUrl, input);
    }
  }

  const response = await originalFetch(input, init);

  // Global force-logout: password changed on another device
  if (response.status === 401) {
    const clone = response.clone();
    try {
      const data = await clone.json();
      if (data.forceLogout) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('/?session_expired=password_changed');
      }
    } catch { /* not JSON, ignore */ }
  }

  return response;
};

axios.interceptors.request.use((config) => {
  if (config?.url) {
    config.url = rewriteBackendUrl(config.url);
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter basename='/'>
      <App />
    </BrowserRouter>
);
