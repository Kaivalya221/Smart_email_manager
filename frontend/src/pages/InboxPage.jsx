import { useState, useMemo } from 'react';
import { RefreshCw, LogOut, Inbox } from 'lucide-react';
import EmailCard from '../components/EmailCard.jsx';
import SkeletonEmail from '../components/SkeletonEmail.jsx';
import StatsBar from '../components/StatsBar.jsx';
import FilterBar from '../components/FilterBar.jsx';

export default function InboxPage({ user, emails, loading, syncing, error, onSync, onDisconnect }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePriority, setActivePriority] = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');

  const filtered = useMemo(() => {
    return emails.filter(email => {
      if (activeCategory !== 'All' && email.category !== activeCategory) return false;
      if (activePriority !== 'All' && email.priority !== activePriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          email.subject?.toLowerCase().includes(q) ||
          email.from?.toLowerCase().includes(q) ||
          email.summary?.toLowerCase().includes(q) ||
          email.snippet?.toLowerCase().includes(q) ||
          email.keywords?.some(k => k.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [emails, activeCategory, activePriority, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: '#1a1512' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(20,16,12,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(80,70,60,0.4)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #f59e0b, #b45309)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, boxShadow: '0 2px 12px rgba(245,158,11,0.3)',
            }}>📬</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', fontFamily: '"Instrument Serif", Georgia, serif', lineHeight: 1 }}>
                Mail<span style={{ color: '#f59e0b' }}>Mind</span>
              </div>
              <div style={{ fontSize: 10, color: '#7d7163', fontFamily: 'monospace', marginTop: 1 }}>{user}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onSync}
              disabled={syncing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8, border: 'none',
                background: syncing ? 'rgba(245,158,11,0.15)' : '#f59e0b',
                color: syncing ? '#f59e0b' : '#1a1512',
                fontSize: 12, fontWeight: 600, cursor: syncing ? 'wait' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={onDisconnect}
              title="Disconnect Gmail"
              style={{
                padding: 7, borderRadius: 8, border: 'none',
                background: 'transparent', color: '#7d7163', cursor: 'pointer',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Main */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>

        {/* Error banner */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 14,
            fontSize: 13, color: '#f87171', display: 'flex', gap: 8,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Empty state — show sync prompt */}
        {!loading && !syncing && emails.length === 0 && !error && (
          <div style={{
            background: 'rgba(30,24,20,0.9)', border: '1px solid rgba(80,70,60,0.4)',
            borderRadius: 16, padding: '50px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📬</div>
            <h2 style={{ fontSize: 22, color: '#ffffff', margin: '0 0 8px', fontFamily: '"Instrument Serif", Georgia, serif' }}>
              Gmail Connected!
            </h2>
            <p style={{ fontSize: 14, color: '#7d7163', margin: '0 0 24px' }}>
              Click "Sync Now" to fetch and analyze your emails with AI.
            </p>
            <button
              onClick={onSync}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 10, border: 'none',
                background: '#f59e0b', color: '#1a1512', fontSize: 14,
                fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
              }}
            >
              <RefreshCw size={15} /> Sync My Inbox
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {(syncing && emails.length === 0) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: '#f59e0b' }}>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Fetching emails and running AI analysis...
            </div>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonEmail key={i} />)}
          </div>
        )}

        {/* Re-sync indicator */}
        {syncing && emails.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, fontSize: 12, color: '#f59e0b' }}>
            <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Re-syncing emails...
          </div>
        )}

        {/* Email list */}
        {emails.length > 0 && (
          <>
            <StatsBar emails={emails} />
            <FilterBar
              activeCategory={activeCategory}
              activePriority={activePriority}
              onCategoryChange={setActiveCategory}
              onPriorityChange={setActivePriority}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Count + clear */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#7d7163' }}>
                Showing <strong style={{ color: '#b8ae9e' }}>{filtered.length}</strong>
                {filtered.length !== emails.length && <> of <strong style={{ color: '#b8ae9e' }}>{emails.length}</strong></>} emails
              </span>
              {(activeCategory !== 'All' || activePriority !== 'All' || searchQuery) && (
                <button
                  onClick={() => { setActiveCategory('All'); setActivePriority('All'); setSearchQuery(''); }}
                  style={{ fontSize: 12, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* No results */}
            {filtered.length === 0 ? (
              <div style={{
                background: 'rgba(30,24,20,0.9)', border: '1px solid rgba(80,70,60,0.4)',
                borderRadius: 12, padding: '40px 24px', textAlign: 'center',
              }}>
                <p style={{ color: '#504640', fontSize: 14 }}>No emails match your filters.</p>
                <button
                  onClick={() => { setActiveCategory('All'); setActivePriority('All'); setSearchQuery(''); }}
                  style={{ marginTop: 10, fontSize: 12, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map((email) => (
                  <EmailCard key={email.id} email={email} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
