import { useEffect, useMemo, useState } from 'react';
import { Stack, Typography, Box, Grid } from '@mui/material';
import OrgChart from './OrgChart';
import PersonDetails from './PersonDetails';
import { buildOrgChart, normalizeKey } from '../lib/orgChart';
import { createSampleDirectory } from '../lib/sampleDirectory';
import type { DirectoryPerson, OrgNode } from '../types/directory';

const buildNodesById = (roots: OrgNode[]) => {
  const map = new Map<string, OrgNode>();
  const visit = (node: OrgNode) => {
    map.set(node.id, node);
    node.reports.forEach(visit);
  };
  roots.forEach(visit);
  return map;
};

const SignedOutPreview = () => {
  const [people, setPeople] = useState<DirectoryPerson[]>(() => createSampleDirectory());
  const chartData = useMemo(() => buildOrgChart(people), [people]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(chartData.roots[0]?.primaryEmail ?? null);

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

  const handleMove = (userId: string, managerEmail: string | null) => {
    setPeople((prev) =>
      prev.map((person) =>
        person.id === userId
          ? {
              ...person,
              managerEmail: managerEmail ?? undefined
            }
          : person
      )
    );
  };

  return (
    <Stack spacing={2}>
      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={7}>
          <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: { md: 1 } }}>
            <OrgChart
              roots={chartData.roots}
              nodesById={nodesById}
              selectedEmail={selectedEmail}
              onSelect={(email) => setSelectedEmail(email)}
              onMove={handleMove}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          <PersonDetails person={selectedNode ?? null} manager={managerNode ?? null} />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SignedOutPreview;
