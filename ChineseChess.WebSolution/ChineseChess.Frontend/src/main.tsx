import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameHubProvider } from './hubs/GameHubProvider';
import App from './App.tsx'
import './index.css'



const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <BrowserRouter>
      <GameHubProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GameHubProvider>
    </BrowserRouter>
  </StrictMode>
);
