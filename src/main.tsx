import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App'; // TypeScript infers .tsx files automatically; omit the extension

const rootElement = document.getElementById('root');

// Strict type guard to prevent runtime errors if the root element is missing
if (!rootElement) {
  throw new Error(
    "Failed to find the root element. Ensure index.html has a <div id='root'></div>",
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
