import { Paper, Typography, Button, Stack, Alert, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

interface Props {
  onSignIn: () => void;
  isReady: boolean;
  error?: string;
  children?: React.ReactNode;
}

const AuthPrompt = ({ onSignIn, isReady, error, children }: Props) => (
  <Paper elevation={0} sx={{ p: 5, textAlign: 'center' }}>
    <Stack spacing={3} alignItems="center">
      <LockIcon color="primary" sx={{ fontSize: 48 }} />
      <Typography variant="h5" fontWeight={500} color="text.primary">
        Visualize your Google Workspace's Directory
      </Typography>
      <List sx={{ width: '100%', maxWidth: 480, textAlign: 'left' }}>
        {[
          'Show your organisation as a tree structure.',
          "Drag & drop users to organize who's their manager.",
          "Everything happens in your browser. And it's all free."
        ].map((text) => (
          <ListItem key={text} disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon sx={{ color: '#34a853', fontSize: 22 }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: 'text.secondary' }} primary={text} />
          </ListItem>
        ))}
      </List>
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        variant="contained"
        size="large"
        onClick={onSignIn}
        disabled={!isReady}
      >
        Sign in with Google
      </Button>
      {children && (
        <Stack spacing={2} width="100%">
          <Divider />
          {children}
        </Stack>
      )}
    </Stack>
  </Paper>
);

export default AuthPrompt;
