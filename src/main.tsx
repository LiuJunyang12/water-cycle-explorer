import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Elemen #root tidak dijumpai dalam index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
