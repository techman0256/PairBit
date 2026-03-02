import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/themeContext';
import './index.css'
import App from './App.tsx'
import { MessageProvider } from './context/messageContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <MessageProvider>
        <App />
      </MessageProvider>
    </ThemeProvider>
  </StrictMode>
)
