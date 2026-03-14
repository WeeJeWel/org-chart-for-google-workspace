import { useEffect, useMemo, useState } from 'react';
import { GOOGLE_CLIENT_ID } from '../config';

type AuthError = string | undefined;

export interface GoogleAuthState {
  isReady: boolean;
  accessToken?: string;
  signIn: () => void;
  signOut: () => void;
  error: AuthError;
}

const SCRIPT_ID = 'google-client-js';
const STORAGE_KEY = 'workspace-org-access-token';

interface StoredToken {
  token: string;
  expiresAt: number;
}

const ensureScriptHasListeners = (onReady: () => void, onError: (msg: string) => void) => {
  const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    onError('Google Identity script tag is missing.');
    return;
  }

  if (script.dataset.loaded === 'true' || window.google?.accounts?.oauth2) {
    onReady();
    return;
  }

  const handleLoad = () => {
    script.dataset.loaded = 'true';
    onReady();
  };

  const handleError = () => onError('Unable to load Google Identity Services.');

  script.addEventListener('load', handleLoad, { once: true });
  script.addEventListener('error', handleError, { once: true });
};

export const useGoogleAuth = (scope: string): GoogleAuthState => {
  const [isReady, setReady] = useState(false);
  const [error, setError] = useState<AuthError>();
  const [accessToken, setAccessToken] = useState<string>();
  const [tokenClient, setTokenClient] = useState<google.accounts.oauth2.TokenClient>();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as StoredToken;
      if (parsed.expiresAt > Date.now()) {
        setAccessToken(parsed.token);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (storageError) {
      console.warn('Failed to read stored token', storageError);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    ensureScriptHasListeners(
      () => setReady(true),
      (message) => setError(message)
    );
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (tokenClient) return;
    if (!window.google?.accounts?.oauth2) return;

    const clientId = GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Missing GOOGLE_CLIENT_ID. Update src/config.ts.');
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          setError(tokenResponse.error);
          return;
        }
        const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
        setAccessToken(tokenResponse.access_token);
        const storedToken: StoredToken = {
          token: tokenResponse.access_token,
          expiresAt
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedToken));
        setError(undefined);
      }
    });

    setTokenClient(client);
  }, [isReady, scope, tokenClient]);

  const signIn = () => {
    if (!tokenClient) return;
    setError(undefined);
    tokenClient.requestAccessToken(
      accessToken
        ? { prompt: '' }
        : undefined
    );
  };

  const signOut = () => {
    if (!accessToken) return;
    window.google?.accounts.oauth2.revoke(accessToken, () => {
      setAccessToken(undefined);
      sessionStorage.removeItem(STORAGE_KEY);
    });
  };

  return useMemo(
    () => ({
      isReady: Boolean(tokenClient),
      accessToken,
      signIn,
      signOut,
      error
    }),
    [tokenClient, accessToken, error]
  );
};
