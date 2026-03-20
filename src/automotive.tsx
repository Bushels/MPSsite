import React from 'react';
import ReactDOM from 'react-dom/client';
import { AutomotiveSite } from './layouts/AutomotiveSite';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AutomotiveSite />
  </React.StrictMode>,
);
