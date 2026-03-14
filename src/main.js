import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(App, {})] }) }));
