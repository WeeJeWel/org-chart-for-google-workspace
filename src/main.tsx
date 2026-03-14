import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif'
  },
  palette: {
    primary: {
      main: '#1a73e8'
    },
    secondary: {
      main: '#34a853'
    },
    background: {
      default: '#f8f9fa'
    }
  },
  shape: {
    borderRadius: 12
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
