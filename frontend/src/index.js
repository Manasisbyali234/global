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
window.fetch = (input, init) => {
  if (typeof input === 'string') {
    return originalFetch(rewriteBackendUrl(input), init);
  }

  if (input instanceof Request) {
    const rewrittenUrl = rewriteBackendUrl(input.url);
    if (rewrittenUrl !== input.url) {
      const rewrittenRequest = new Request(rewrittenUrl, input);
      return originalFetch(rewrittenRequest, init);
    }
  }

  return originalFetch(input, init);
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
