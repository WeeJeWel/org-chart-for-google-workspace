import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { AppBar, Toolbar, Typography, Stack, IconButton, Menu, MenuItem, Avatar, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
const AppHeader = ({ isSignedIn, onSignIn, onSignOut, activeAdmin }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const handleAvatarClick = (event) => {
        setMenuAnchor(event.currentTarget);
    };
    const handleMenuClose = () => setMenuAnchor(null);
    return (_jsx(AppBar, { position: "static", color: "transparent", elevation: 0, sx: { borderBottom: '1px solid #e0e0e0' }, children: _jsxs(Toolbar, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(GoogleIcon, { color: "primary" }), _jsx(Typography, { variant: "h6", fontWeight: 500, color: "text.primary", children: "Org Chart for Google Workspace" })] }), isSignedIn && activeAdmin ? (_jsxs(_Fragment, { children: [_jsx(IconButton, { onClick: handleAvatarClick, sx: { p: 0 }, children: activeAdmin.photoUrl ? (_jsx(Box, { component: "img", src: activeAdmin.photoUrl, alt: `${activeAdmin.displayName}'s avatar`, loading: "lazy", sx: { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' } })) : (_jsx(Avatar, { sx: { width: 36, height: 36 }, children: activeAdmin.displayName[0] })) }), _jsx(Menu, { anchorEl: menuAnchor, open: Boolean(menuAnchor), onClose: handleMenuClose, anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, transformOrigin: { vertical: 'top', horizontal: 'right' }, children: _jsx(MenuItem, { onClick: () => {
                                    handleMenuClose();
                                    onSignOut();
                                }, children: "Sign out" }) })] })) : null] }) }));
};
export default AppHeader;
