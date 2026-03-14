import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Paper, Typography, Button, Stack, Alert, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
const AuthPrompt = ({ onSignIn, isReady, error, children }) => (_jsx(Paper, { elevation: 0, sx: { p: 5, textAlign: 'center' }, children: _jsxs(Stack, { spacing: 3, alignItems: "center", children: [_jsx(LockIcon, { color: "primary", sx: { fontSize: 48 } }), _jsx(Typography, { variant: "h5", fontWeight: 500, color: "text.primary", children: "Visualize your Google Workspace's Directory" }), _jsx(List, { sx: { width: '100%', maxWidth: 480, textAlign: 'left' }, children: [
                    'Show your organisation as a tree structure.',
                    "Drag & drop users to organize who's their manager.",
                    "Everything happens in your browser. And it's all free."
                ].map((text) => (_jsxs(ListItem, { disableGutters: true, children: [_jsx(ListItemIcon, { sx: { minWidth: 36 }, children: _jsx(CheckCircleIcon, { sx: { color: '#34a853', fontSize: 22 } }) }), _jsx(ListItemText, { primaryTypographyProps: { color: 'text.secondary' }, primary: text })] }, text))) }), error && _jsx(Alert, { severity: "error", children: error }), _jsx(Button, { variant: "contained", size: "large", onClick: onSignIn, disabled: !isReady, children: "Sign in with Google" }), children && (_jsxs(Stack, { spacing: 2, width: "100%", children: [_jsx(Divider, {}), children] }))] }) }));
export default AuthPrompt;
