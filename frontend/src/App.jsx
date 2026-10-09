import { useState, useEffect, useCallback } from 'react';
import { api, getStoredUser, setStoredUser } from './utils/api.js';
import ConnectPage from './pages/ConnectPage.jsx';
import InboxPage from './pages/InboxPage.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);

  // On mount: check URL params for OAuth callback result, then check stored session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const urlUser = params.get('user');
    const urlError = params.get('error');

    // Clean URL
    if (params.toString()) {
      window.history.replaceState({}, '', '/');
    }

    if (urlError) {
      setAuthError(decodeURIComponent(urlError));
      setLoading(false);
      return;
    }

    if (connected === 'true' && urlUser) {
      const decodedUser = decodeURIComponent(urlUser);
      setStoredUser(decodedUser);
      setUser(decodedUser);
      setLoading(false);
      return;
    }

    // Check for stored user
    const storedUser = getStoredUser();
    if (storedUser) {
      // Verify token is still valid
      api.getAuthStatus(storedUser)
        .then(status => {
          if (status.connected) {
            setUser(storedUser);
          } else {
            setStoredUser(null);
          }
        })
        .catch(() => setStoredUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSync = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    setError(null);
    try {
      const data = await api.fetchEmails(user);
      setEmails(data.emails || []);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch emails';
      setError(msg);
      if (err.response?.status === 401) {
        setStoredUser(null);
        setUser(null);
      }
    } finally {
      setSyncing(false);
    }
  }, [user]);

  const handleDisconnect = () => {
    setStoredUser(null);
    setUser(null);
    setEmails([]);
    setError(null);
  };

  // Initial loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse-soft">📬</div>
          <p className="text-ink-500 text-sm font-mono">Loading MailMind...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <ConnectPage error={authError} />;
  }

  return (
    <InboxPage
      user={user}
      emails={emails}
      loading={loading}
      syncing={syncing}
      error={error}
      onSync={handleSync}
      onDisconnect={handleDisconnect}
    />
  );
}
