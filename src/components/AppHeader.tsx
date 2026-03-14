import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Box
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import type { DirectoryPerson } from '../types/directory';

interface Props {
  isSignedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  activeAdmin?: DirectoryPerson;
}

const AppHeader = ({ isSignedIn, onSignIn, onSignOut, activeAdmin }: Props) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <GoogleIcon color="primary" />
          <Typography variant="h6" fontWeight={500} color="text.primary">
            Org Chart for Google Workspace
          </Typography>
        </Stack>
        {isSignedIn && activeAdmin ? (
          <>
            <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
              {activeAdmin.photoUrl ? (
                <Box
                  component="img"
                  src={activeAdmin.photoUrl}
                  alt={`${activeAdmin.displayName}'s avatar`}
                  loading="lazy"
                  sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <Avatar sx={{ width: 36, height: 36 }}>
                  {activeAdmin.displayName[0]}
                </Avatar>
              )}
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  onSignOut();
                }}
              >
                Sign out
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button variant="contained" color="primary" onClick={onSignIn}>
            Sign in
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
