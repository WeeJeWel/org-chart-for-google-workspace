export {};

declare global {
  namespace google.accounts.oauth2 {
    interface TokenResponse {
      access_token: string;
      error?: string;
      expires_in: number;
      scope: string;
      token_type: string;
    }

    interface TokenClientConfig {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
      prompt?: string;
    }

    interface TokenClient {
      callback: (response: TokenResponse) => void;
      requestAccessToken: (options?: { prompt?: string }) => void;
    }
  }

  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: google.accounts.oauth2.TokenClientConfig) => google.accounts.oauth2.TokenClient;
          revoke: (accessToken: string, done?: () => void) => void;
        };
      };
    };
  }
}
