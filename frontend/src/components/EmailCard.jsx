import { useState } from 'react';
import { Star, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import {
  formatDate, extractSenderName, getSenderInitials,
  CATEGORY_CONFIG, PRIORITY_CONFIG, SENTIMENT_CONFIG
} from '../utils/emailUtils.js';

const AVATAR_COLORS = ['#4f46e5','#7c3aed','#db2777','#e11d48','#d97706','#15803d','#0e7490','#0f766e'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const PRIORITY_STYLES = {
  High:   { color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)',  dot: '#f87171' },
  Medium: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', dot: '#fbbf24' },
  Low:    { color: '#9ca3af', bg: 'rgba(75,85,99,0.2)',    border: 'rgba(75,85,99,0.3)',   dot: '#6b7280' },
};

const SENTIMENT_STYLES = {
  Positive: { color: '#4ade80', symbol: '↑' },
  Neutral:  { color: '#9ca3af', symbol: '→' },
  Negative: { color: '#f87171', symbol: '↓' },
};

export default function EmailCard({ email }) {
  const [expanded, setExpanded] = useState(false);

  const senderName = extractSenderName(email.from);
  const initials    = getSenderInitials(senderName);
  const avatarBg    = getAvatarColor(senderName);
  const catConfig   = CATEGORY_CONFIG[email.category]  || CATEGORY_CONFIG['Personal'];
  const priStyle    = PRIORITY_STYLES[email.priority]  || PRIORITY_STYLES['Medium'];
  const sentStyle   = SENTIMENT_STYLES[email.sentiment] || SENTIMENT_STYLES['Neutral'];

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: 'rgba(30, 24, 20, 0.9)',
        border: '1px solid rgba(80, 70, 60, 0.45)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)';   e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Unread top stripe */}
      {!email.isRead && (
        <div style={{ height: 2, background: 'linear-gradient(90deg, #f59e0b, #fbbf24, transparent)' }} />
      )}

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Row 1: sender + date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{
                  fontSize: 13, fontWeight: email.isRead ? 400 : 600,
                  color: email.isRead ? '#b8ae9e' : '#ffffff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {senderName}
                </span>
                {email.action_required && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 10, color: '#fbbf24',
                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 999, padding: '2px 6px', flexShrink: 0,
                  }}>
                    <Zap size={8} /> Action
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {email.isStarred && <Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />}
                <span style={{ fontSize: 11, color: '#7d7163', fontFamily: 'monospace' }}>
                  {formatDate(email.date)}
                </span>
              </div>
            </div>

            {/* Row 2: subject */}
            <p style={{
              fontSize: 13, margin: '0 0 5px 0',
              color: email.isRead ? '#b8ae9e' : '#e8e4dc',
              fontWeight: email.isRead ? 400 : 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {email.subject}
            </p>

            {/* Row 3: summary */}
            <p style={{
              fontSize: 12, color: '#7d7163', margin: '0 0 10px 0',
              lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {email.summary || email.snippet}
            </p>

            {/* Row 4: badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {/* Category */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 500,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999, padding: '2px 8px', color: '#d4cdc0',
              }}>
                <span style={{ fontSize: 10 }}>{catConfig.icon}</span>
                {email.category}
              </span>

              {/* Priority */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11,
                background: priStyle.bg, border: `1px solid ${priStyle.border}`,
                borderRadius: 999, padding: '2px 8px', color: priStyle.color,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: priStyle.dot, flexShrink: 0 }} />
                {email.priority}
              </span>

              {/* Sentiment */}
              <span style={{ fontSize: 11, color: sentStyle.color, fontFamily: 'monospace' }}>
                {sentStyle.symbol} {email.sentiment}
              </span>

              {/* Expand button */}
              <button
                onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#7d7163', padding: 2 }}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(80,70,60,0.4)', padding: '12px 16px 14px', background: 'rgba(10,8,6,0.4)' }}>
          {email.keywords?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 10, color: '#504640', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Keywords</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {email.keywords.map((kw, i) => (
                  <span key={i} style={{
                    fontSize: 11, color: '#9a8e7c',
                    background: 'rgba(60,50,45,0.6)', border: '1px solid rgba(80,70,60,0.5)',
                    borderRadius: 4, padding: '2px 7px', fontFamily: 'monospace',
                  }}>#{kw}</span>
                ))}
              </div>
            </div>
          )}

          {(email.body || email.snippet) && (
            <div>
              <p style={{ fontSize: 10, color: '#504640', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Preview</p>
              <p style={{
                fontSize: 12, color: '#9a8e7c', lineHeight: 1.6,
                background: 'rgba(20,15,12,0.6)', borderRadius: 8, padding: '10px 12px',
                border: '1px solid rgba(60,50,45,0.4)',
                maxHeight: 120, overflowY: 'auto', margin: 0,
              }}>
                {email.body || email.snippet}
              </p>
            </div>
          )}

          <p style={{ fontSize: 11, color: '#504640', marginTop: 8 }}>
            <span style={{ color: '#3d3530' }}>From: </span>
            <span style={{ fontFamily: 'monospace', color: '#7d7163' }}>{email.from}</span>
          </p>
        </div>
      )}
    </div>
  );
}
