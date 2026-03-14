import { memo, useState, forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { Box, Stack, Typography, Avatar, Paper } from '@mui/material';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import type { OrgNode } from '../types/directory';
import { CSS } from '@dnd-kit/utilities';

const ROOT_DROP_ID = 'orgchart::root-drop';

interface OrgChartProps {
  roots: OrgNode[];
  nodesById: Map<string, OrgNode>;
  selectedEmail?: string | null;
  onSelect: (email: string) => void;
  onMove: (userId: string, managerEmail: string | null) => void;
}

interface PersonLabelProps {
  node: OrgNode;
  isSelected: boolean;
  isDragging?: boolean;
  isOver?: boolean;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  onClick?: () => void;
}

const PersonLabel = memo(
  forwardRef<HTMLButtonElement, PersonLabelProps>(
    ({ node, isSelected, isDragging, isOver, dragHandleProps, onClick }, ref) => (
      <Paper
        component="button"
        ref={ref}
        elevation={isSelected ? 4 : 0}
        sx={{
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
        }}
        onClick={(event) => {
          event.stopPropagation();
          onClick?.();
        }}
        {...dragHandleProps}
      >
        {node.photoUrl ? (
          <Box
            component="img"
            src={node.photoUrl}
            alt={`${node.displayName}'s avatar`}
            loading="lazy"
            sx={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <Avatar sx={{ width: 40, height: 40 }}>
            {node.displayName[0]}
          </Avatar>
        )}
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
              {node.displayName}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {node.primaryEmail}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {node.jobTitle ?? '—'}
          </Typography>
          {node.department && (
            <Typography variant="caption" color="text.disabled">
              {node.department}
            </Typography>
          )}
        </Box>
      </Paper>
    )
  )
);

PersonLabel.displayName = 'PersonLabel';

interface OrgTreeProps {
  node: OrgNode;
  selectedEmail?: string | null;
  onSelect: (email: string) => void;
}

const OrgTree = ({ node, selectedEmail, onSelect }: OrgTreeProps) => {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({ id: node.id });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: node.id });

  const combinedRef = (element: HTMLButtonElement | null) => {
    setDragRef(element);
    setDropRef(element);
  };

  return (
    <Box component="li" sx={{ listStyle: 'none', mt: 1 }}>
      <PersonLabel
        ref={combinedRef}
        node={node}
        isSelected={selectedEmail === node.primaryEmail}
        isDragging={isDragging}
        isOver={isOver}
        dragHandleProps={{
          ...listeners,
          ...attributes,
          style: {
            transform: transform ? CSS.Transform.toString(transform) : undefined,
            touchAction: 'none'
          }
        }}
        onClick={() => onSelect(node.primaryEmail)}
      />
      {node.reports.length > 0 && (
        <Box component="ul" sx={{ pl: 3, borderLeft: '1px solid', borderColor: 'divider', ml: 2 }}>
          {node.reports.map((child) => (
            <OrgTree
              key={child.primaryEmail}
              node={child}
              selectedEmail={selectedEmail}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const RootDropZone = ({ activeId }: { activeId: string | null }) => {
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROP_ID });
  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
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
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Drop here to remove this user's manager.
      </Typography>
      {activeId && (
        <Typography variant="caption" color="text.disabled">
          Active card: {activeId}
        </Typography>
      )}
    </Paper>
  );
};

const containsId = (node: OrgNode, candidateId: string): boolean => {
  if (node.id === candidateId) return true;
  return node.reports.some((child) => containsId(child, candidateId));
};

const getNodeById = (nodesById: Map<string, OrgNode>, id?: string | null) => {
  if (!id) return undefined;
  return nodesById.get(id) ?? undefined;
};

const OrgChart = ({ roots, nodesById, selectedEmail, onSelect, onMove }: OrgChartProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const draggedId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : undefined;

    if (!overId || draggedId === overId) {
      return;
    }

    const draggedNode = getNodeById(nodesById, draggedId);
    if (!draggedNode) return;

    if (overId === ROOT_DROP_ID) {
      if (!draggedNode.managerEmail && !draggedNode.managerId) {
        return;
      }
      onMove(draggedNode.id, null);
      return;
    }

    const newManager = getNodeById(nodesById, overId);
    if (!newManager) return;

    if (containsId(draggedNode, newManager.id)) {
      return;
    }

    if (
      draggedNode.managerEmail &&
      draggedNode.managerEmail.toLowerCase() === newManager.primaryEmail.toLowerCase()
    ) {
      return;
    }

    onMove(draggedNode.id, newManager.primaryEmail);
  };

  const canEdit = roots.length > 0;

  const rootsWithReports = roots.filter((node) => node.reports.length > 0);
  const standaloneRoots = roots.filter((node) => node.reports.length === 0);

  return (
    <Stack spacing={2}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <Stack spacing={2}>
          <Box component="ul" sx={{ m: 0, p: 0 }}>
            {rootsWithReports.map((root) => (
              <OrgTree
                key={root.primaryEmail}
                node={root}
                selectedEmail={selectedEmail}
                onSelect={onSelect}
              />
            ))}
          </Box>
          {rootsWithReports.length > 0 && standaloneRoots.length > 0 && (
            <Box
              sx={{
                borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
                my: 2
              }}
            />
          )}
          {standaloneRoots.length > 0 && (
            <Box component="ul" sx={{ m: 0, p: 0 }}>
              {standaloneRoots.map((root) => (
                <OrgTree
                  key={root.primaryEmail}
                  node={root}
                  selectedEmail={selectedEmail}
                  onSelect={onSelect}
                />
              ))}
            </Box>
          )}
          {activeId && canEdit && <RootDropZone activeId={activeId} />}
        </Stack>
      </DndContext>
      {roots.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">No users were returned by the Directory API.</Typography>
        </Paper>
      )}
    </Stack>
  );
};

export default OrgChart;
