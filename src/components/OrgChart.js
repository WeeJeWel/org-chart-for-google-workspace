import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState, forwardRef } from 'react';
import { Box, Stack, Typography, Avatar, Paper } from '@mui/material';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
const ROOT_DROP_ID = 'orgchart::root-drop';
const PersonLabel = memo(forwardRef(({ node, isSelected, isDragging, isOver, dragHandleProps, onClick }, ref) => (_jsxs(Paper, { component: "button", ref: ref, elevation: isSelected ? 4 : 0, sx: {
        px: 1.5,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderWidth: isOver ? 2 : 1,
        borderStyle: isOver ? 'dashed' : 'solid',
        borderColor: isOver ? 'primary.main' : isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'primary.50' : isOver ? 'primary.50' : 'background.paper',
        boxShadow: isOver
            ? (theme) => `0 0 0 3px ${theme.palette.primary.main}33`
            : undefined,
        minWidth: 220,
        textAlign: 'left',
        cursor: isDragging ? 'grabbing' : 'grab',
        width: '100%',
        opacity: isDragging ? 0.6 : 1,
        transformOrigin: 'left center',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease'
    }, onClick: (event) => {
        event.stopPropagation();
        onClick?.();
    }, ...dragHandleProps, children: [node.photoUrl ? (_jsx(Box, { component: "img", src: node.photoUrl, alt: `${node.displayName}'s avatar`, loading: "lazy", sx: { width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' } })) : (_jsx(Avatar, { sx: { width: 40, height: 40 }, children: node.displayName[0] })), _jsxs(Box, { children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Typography, { variant: "subtitle2", color: "text.primary", fontWeight: 600, children: node.displayName }), _jsx(Typography, { variant: "body2", color: "text.disabled", children: node.primaryEmail })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: node.jobTitle ?? '—' }), node.department && (_jsx(Typography, { variant: "caption", color: "text.disabled", children: node.department }))] })] }))));
PersonLabel.displayName = 'PersonLabel';
const OrgTree = ({ node, selectedEmail, onSelect }) => {
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id: node.id });
    const { isOver, setNodeRef: setDropRef } = useDroppable({ id: node.id });
    const combinedRef = (element) => {
        setDragRef(element);
        setDropRef(element);
    };
    return (_jsxs(Box, { component: "li", sx: { listStyle: 'none', mt: 1 }, children: [_jsx(PersonLabel, { ref: combinedRef, node: node, isSelected: selectedEmail === node.primaryEmail, isDragging: isDragging, isOver: isOver, dragHandleProps: {
                    ...listeners,
                    ...attributes,
                    style: {
                        transform: transform ? CSS.Transform.toString(transform) : undefined,
                        touchAction: 'none'
                    }
                }, onClick: () => onSelect(node.primaryEmail) }), node.reports.length > 0 && (_jsx(Box, { component: "ul", sx: { pl: 3, borderLeft: '1px solid', borderColor: 'divider', ml: 2 }, children: node.reports.map((child) => (_jsx(OrgTree, { node: child, selectedEmail: selectedEmail, onSelect: onSelect }, child.primaryEmail))) }))] }));
};
const RootDropZone = ({ activeId }) => {
    const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROP_ID });
    return (_jsxs(Paper, { ref: setNodeRef, variant: "outlined", sx: {
            p: 2,
            textAlign: 'center',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: isOver ? 'primary.main' : 'divider',
            bgcolor: isOver ? 'primary.50' : 'background.paper',
            boxShadow: isOver
                ? (theme) => `0 0 0 3px ${theme.palette.primary.main}33`
                : 'none',
            transition: 'all 0.2s ease-in-out'
        }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Drop here to remove this user's manager." }), activeId && (_jsxs(Typography, { variant: "caption", color: "text.disabled", children: ["Active card: ", activeId] }))] }));
};
const containsId = (node, candidateId) => {
    if (node.id === candidateId)
        return true;
    return node.reports.some((child) => containsId(child, candidateId));
};
const getNodeById = (nodesById, id) => {
    if (!id)
        return undefined;
    return nodesById.get(id) ?? undefined;
};
const OrgChart = ({ roots, nodesById, selectedEmail, onSelect, onMove }) => {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
    const [activeId, setActiveId] = useState(null);
    const handleDragStart = (event) => {
        setActiveId(String(event.active.id));
    };
    const handleDragEnd = (event) => {
        setActiveId(null);
        const draggedId = String(event.active.id);
        const overId = event.over?.id ? String(event.over.id) : undefined;
        if (!overId || draggedId === overId) {
            return;
        }
        const draggedNode = getNodeById(nodesById, draggedId);
        if (!draggedNode)
            return;
        if (overId === ROOT_DROP_ID) {
            if (!draggedNode.managerEmail && !draggedNode.managerId) {
                return;
            }
            onMove(draggedNode.id, null);
            return;
        }
        const newManager = getNodeById(nodesById, overId);
        if (!newManager)
            return;
        if (containsId(draggedNode, newManager.id)) {
            return;
        }
        if (draggedNode.managerEmail &&
            draggedNode.managerEmail.toLowerCase() === newManager.primaryEmail.toLowerCase()) {
            return;
        }
        onMove(draggedNode.id, newManager.primaryEmail);
    };
    const canEdit = roots.length > 0;
    const rootsWithReports = roots.filter((node) => node.reports.length > 0);
    const standaloneRoots = roots.filter((node) => node.reports.length === 0);
    return (_jsxs(Stack, { spacing: 2, children: [_jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragStart: handleDragStart, onDragEnd: handleDragEnd, onDragCancel: () => setActiveId(null), children: _jsxs(Stack, { spacing: 2, children: [_jsx(Box, { component: "ul", sx: { m: 0, p: 0 }, children: rootsWithReports.map((root) => (_jsx(OrgTree, { node: root, selectedEmail: selectedEmail, onSelect: onSelect }, root.primaryEmail))) }), rootsWithReports.length > 0 && standaloneRoots.length > 0 && (_jsx(Box, { sx: {
                                borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
                                my: 2
                            } })), standaloneRoots.length > 0 && (_jsx(Box, { component: "ul", sx: { m: 0, p: 0 }, children: standaloneRoots.map((root) => (_jsx(OrgTree, { node: root, selectedEmail: selectedEmail, onSelect: onSelect }, root.primaryEmail))) })), activeId && canEdit && _jsx(RootDropZone, { activeId: activeId })] }) }), roots.length === 0 && (_jsx(Paper, { sx: { p: 3 }, children: _jsx(Typography, { color: "text.secondary", children: "No users were returned by the Directory API." }) }))] }));
};
export default OrgChart;
