import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Paper, Stack, Typography, Avatar, Chip, Divider, Button, TextField, IconButton, Tooltip, Link, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PhoneIcon from '@mui/icons-material/Phone';
import type { OrgNode } from '../types/directory';

interface Props {
  person?: OrgNode | null;
  manager?: OrgNode | null;
  onFocusManager?: (email: string) => void;
  onUpdateTitle?: (title: string) => void;
  pendingTitle?: string;
  isUpdatingTitle?: boolean;
}

const FieldRow = ({ icon, label, value }: { icon: ReactNode; label: string; value?: ReactNode }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" width="100%">
    {icon}
    <Stack alignItems="flex-start">
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary">
        {value ?? '—'}
      </Typography>
    </Stack>
  </Stack>
);

const PersonDetails = ({ person, manager, onFocusManager, onUpdateTitle, pendingTitle, isUpdatingTitle }: Props) => {
  if (!person) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">Select someone from the chart to view their profile.</Typography>
      </Paper>
    );
  }

  const currentTitle = pendingTitle ?? person.jobTitle ?? '';
  const [titleDraft, setTitleDraft] = useState(currentTitle);
  const [isEditingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

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

  const avatarNode = person.photoUrl ? (
    <Box
      component="img"
      src={person.photoUrl}
      alt={`${person.displayName}'s avatar`}
      referrerPolicy="no-referrer"
      loading="lazy"
      sx={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }}
    />
  ) : (
    <Avatar sx={{ width: 96, height: 96, fontSize: 32 }}>
      {person.displayName[0]}
    </Avatar>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2} alignItems="center">
        {avatarNode}
        <Stack spacing={1} alignItems="center" width="100%">
          <Typography variant="h6" fontWeight={600}>
            {person.displayName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {isEditingTitle ? (
              <TextField
                inputRef={titleInputRef}
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                size="small"
                placeholder="Add a title"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleTitleSave();
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    setTitleDraft(currentTitle);
                    setEditingTitle(false);
                  }
                }}
              />
            ) : (
              <Typography color="text.secondary">{currentTitle || 'No title'}</Typography>
            )}
            {onUpdateTitle && (
              !isEditingTitle ? (
                <Tooltip title="Edit title">
                  <span>
                    <IconButton size="small" onClick={() => setEditingTitle(true)}>
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleTitleSave}
                    disabled={!titleChanged || isUpdatingTitle}
                  >
                    Save
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setTitleDraft(currentTitle);
                      setEditingTitle(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              )
            )}
          </Stack>
          {person.department && (
            <Chip icon={<ApartmentIcon />} label={person.department} size="small" color="primary" variant="outlined" />
          )}
        </Stack>
        <Divider flexItem />
        <Stack spacing={2} width="100%">
          <FieldRow icon={<MailOutlineIcon color="action" />} label="Email" value={person.primaryEmail} />
          <FieldRow icon={<PhoneIcon color="action" />} label="Phone" value={person.phone} />
          {hasManagerInfo && (
            <FieldRow
              icon={<ApartmentIcon color="action" />}
              label="Manager"
              value={manager ? (
                <Link component="button" onClick={() => onFocusManager?.(manager.primaryEmail)} underline="hover">
                  {managerLabel}
                </Link>
              ) : (
                managerLabel
              )}
            />
          )}
        </Stack>
        <Divider flexItem />
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="h4">{person.reports.length}</Typography>
          <Typography variant="body2" color="text.secondary">
            Direct reports
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PersonDetails;
