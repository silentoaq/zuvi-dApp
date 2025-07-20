import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WalletContextProvider } from './providers/WalletProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WalletContextProvider>
  </React.StrictMode>
);