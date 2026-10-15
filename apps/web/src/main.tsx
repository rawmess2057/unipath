import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { IconSprite } from './shell/IconSprite';
import './globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconSprite />
    <App />
  </StrictMode>,
);
