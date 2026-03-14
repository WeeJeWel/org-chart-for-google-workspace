import { Paper, Typography, Button, Stack, Alert, Divider } from '@mui/material';
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
        Connect your Google Workspace directory
      </Typography>
      <Typography color="text.secondary" maxWidth={480}>
        Sign in with a Google Workspace admin account to fetch and edit your live organization chart using the Directory API.
        Drag-and-drop moves update each person's manager instantly while all data stays inside this browser tab.
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Button
        variant="contained"
        size="large"
        onClick={onSignIn}
        disabled={!isReady}
      >
        Continue with Google
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
