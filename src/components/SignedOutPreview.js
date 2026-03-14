import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Stack, Box, Grid } from '@mui/material';
import OrgChart from './OrgChart';
import PersonDetails from './PersonDetails';
import { buildOrgChart, normalizeKey } from '../lib/orgChart';
import { createSampleDirectory } from '../lib/sampleDirectory';
const buildNodesById = (roots) => {
    const map = new Map();
    const visit = (node) => {
        map.set(node.id, node);
        node.reports.forEach(visit);
    };
    roots.forEach(visit);
    return map;
};
const SignedOutPreview = () => {
    const [people, setPeople] = useState(() => createSampleDirectory());
    const chartData = useMemo(() => buildOrgChart(people), [people]);
    const [selectedEmail, setSelectedEmail] = useState(chartData.roots[0]?.primaryEmail ?? null);
    useEffect(() => {
        if (!selectedEmail && chartData.roots[0]) {
            setSelectedEmail(chartData.roots[0].primaryEmail);
        }
    }, [chartData, selectedEmail]);
    const nodesById = useMemo(() => buildNodesById(chartData.roots), [chartData]);
    const selectedNode = selectedEmail
        ? chartData.nodeIndex.get(normalizeKey(selectedEmail) ?? selectedEmail)
        : undefined;
    const managerNode = selectedNode?.managerEmail
        ? chartData.nodeIndex.get(normalizeKey(selectedNode.managerEmail) ?? selectedNode.managerEmail)
        : undefined;
    const handleMove = (userId, managerEmail) => {
        setPeople((prev) => prev.map((person) => person.id === userId
            ? {
                ...person,
                managerEmail: managerEmail ?? undefined
            }
            : person));
    };
    return (_jsx(Stack, { spacing: 2, children: _jsxs(Grid, { container: true, spacing: 3, alignItems: "flex-start", children: [_jsx(Grid, { item: true, xs: 12, md: 7, children: _jsx(Box, { sx: { maxHeight: 360, overflowY: 'auto', pr: { md: 1 } }, children: _jsx(OrgChart, { roots: chartData.roots, nodesById: nodesById, selectedEmail: selectedEmail, onSelect: (email) => setSelectedEmail(email), onMove: handleMove }) }) }), _jsx(Grid, { item: true, xs: 12, md: 5, children: _jsx(PersonDetails, { person: selectedNode ?? null, manager: managerNode ?? null }) })] }) }));
};
export default SignedOutPreview;
