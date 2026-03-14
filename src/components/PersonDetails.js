import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Paper, Stack, Typography, Avatar, Chip, Divider, Button, TextField, IconButton, Tooltip, Link, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PhoneIcon from '@mui/icons-material/Phone';
const FieldRow = ({ icon, label, value }) => (_jsxs(Stack, { direction: "row", spacing: 1.5, alignItems: "center", children: [icon, _jsxs(Stack, { children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: label }), _jsx(Typography, { variant: "body2", color: "text.primary", children: value ?? '—' })] })] }));
const PersonDetails = ({ person, manager, onFocusManager, onUpdateTitle, pendingTitle, isUpdatingTitle }) => {
    if (!person) {
        return (_jsx(Paper, { sx: { p: 3 }, children: _jsx(Typography, { color: "text.secondary", children: "Select someone from the chart to view their profile." }) }));
    }
    const currentTitle = pendingTitle ?? person.jobTitle ?? '';
    const [titleDraft, setTitleDraft] = useState(currentTitle);
    const [isEditingTitle, setEditingTitle] = useState(false);
    const titleInputRef = useRef(null);
    const managerLabel = manager?.displayName ?? person.managerDisplayName ?? person.managerEmail;
    const hasManagerInfo = Boolean(managerLabel);
    const titleChanged = titleDraft !== currentTitle;
    const handleTitleSave = () => {
        if (!onUpdateTitle) {
            setEditingTitle(false);
            return;
        }
        if (!titleChanged) {
            setEditingTitle(false);
            return;
        }
        onUpdateTitle(titleDraft.trim());
        setEditingTitle(false);
    };
    useEffect(() => {
        setTitleDraft(currentTitle);
    }, [currentTitle, person.id]);
    useEffect(() => {
        if (isEditingTitle) {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
        }
    }, [isEditingTitle]);
    const avatarNode = person.photoUrl ? (_jsx(Box, { component: "img", src: person.photoUrl, alt: `${person.displayName}'s avatar`, referrerPolicy: "no-referrer", loading: "lazy", sx: { width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' } })) : (_jsx(Avatar, { sx: { width: 96, height: 96, fontSize: 32 }, children: person.displayName[0] }));
    return (_jsx(Paper, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 2, alignItems: "center", children: [avatarNode, _jsxs(Stack, { spacing: 1, alignItems: "center", width: "100%", children: [_jsx(Typography, { variant: "h6", fontWeight: 600, children: person.displayName }), _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [isEditingTitle ? (_jsx(TextField, { inputRef: titleInputRef, value: titleDraft, onChange: (event) => setTitleDraft(event.target.value), size: "small", placeholder: "Add a title", onKeyDown: (event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleTitleSave();
                                        }
                                        else if (event.key === 'Escape') {
                                            event.preventDefault();
                                            setTitleDraft(currentTitle);
                                            setEditingTitle(false);
                                        }
                                    } })) : (_jsx(Typography, { color: "text.secondary", children: currentTitle || 'No title' })), onUpdateTitle && (!isEditingTitle ? (_jsx(Tooltip, { title: "Edit title", children: _jsx("span", { children: _jsx(IconButton, { size: "small", onClick: () => setEditingTitle(true), children: _jsx(EditIcon, { fontSize: "inherit" }) }) }) })) : (_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Button, { variant: "contained", size: "small", onClick: handleTitleSave, disabled: !titleChanged || isUpdatingTitle, children: "Save" }), _jsx(Button, { variant: "text", size: "small", onClick: () => {
                                                setTitleDraft(currentTitle);
                                                setEditingTitle(false);
                                            }, children: "Cancel" })] })))] }), person.department && (_jsx(Chip, { icon: _jsx(ApartmentIcon, {}), label: person.department, size: "small", color: "primary", variant: "outlined" }))] }), _jsx(Divider, { flexItem: true }), _jsxs(Stack, { spacing: 2, width: "100%", children: [_jsx(FieldRow, { icon: _jsx(MailOutlineIcon, { color: "action" }), label: "Email", value: person.primaryEmail }), _jsx(FieldRow, { icon: _jsx(PhoneIcon, { color: "action" }), label: "Phone", value: person.phone }), hasManagerInfo && (_jsx(FieldRow, { icon: _jsx(ApartmentIcon, { color: "action" }), label: "Manager", value: manager ? (_jsx(Link, { component: "button", onClick: () => onFocusManager?.(manager.primaryEmail), underline: "hover", children: managerLabel })) : (managerLabel) }))] }), _jsx(Divider, { flexItem: true }), _jsxs(Stack, { alignItems: "center", spacing: 0.5, children: [_jsx(Typography, { variant: "h4", children: person.reports.length }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Direct reports" })] })] }) }));
};
export default PersonDetails;
