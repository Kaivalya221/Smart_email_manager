export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function extractSenderName(from) {
  if (!from) return 'Unknown';
  const match = from.match(/^"?([^"<]+)"?\s*<?/);
  if (match) return match[1].trim();
  const emailMatch = from.match(/([^@<\s]+)@/);
  return emailMatch ? emailMatch[1] : from;
}

export function extractSenderEmail(from) {
  if (!from) return '';
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from;
}

export function getSenderInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export const CATEGORY_CONFIG = {
  Work:       { color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-400', icon: '💼' },
  Personal:   { color: 'bg-sage-500/20 text-sage-300 border-sage-500/30',      dot: 'bg-sage-400',   icon: '👤' },
  Promotions: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',   dot: 'bg-amber-400',  icon: '🏷️' },
  Spam:       { color: 'bg-red-500/20 text-red-300 border-red-500/30',         dot: 'bg-red-400',    icon: '⚠️' },
  Finance:    { color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',      dot: 'bg-cyan-400',   icon: '💰' },
  Social:     { color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',      dot: 'bg-pink-400',   icon: '💬' },
  Updates:    { color: 'bg-violet-500/20 text-violet-300 border-violet-500/30',dot: 'bg-violet-400', icon: '🔔' },
};

export const PRIORITY_CONFIG = {
  High:   { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',    dot: 'bg-red-400',    label: 'High' },
  Medium: { color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',dot: 'bg-amber-400',  label: 'Medium' },
  Low:    { color: 'text-ink-500',    bg: 'bg-ink-800/50 border-ink-700/30',     dot: 'bg-ink-500',    label: 'Low' },
};

export const SENTIMENT_CONFIG = {
  Positive: { color: 'text-sage-400', symbol: '↑' },
  Neutral:  { color: 'text-ink-400',  symbol: '→' },
  Negative: { color: 'text-coral-400',symbol: '↓' },
};
