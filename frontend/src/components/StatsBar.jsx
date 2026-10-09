import { CATEGORY_CONFIG } from '../utils/emailUtils.js';

export default function StatsBar({ emails }) {
  if (!emails || emails.length === 0) return null;

  const cats = {};
  let unread = 0, actionRequired = 0, highPriority = 0;

  emails.forEach(e => {
    cats[e.category] = (cats[e.category] || 0) + 1;
    if (!e.isRead) unread++;
    if (e.action_required) actionRequired++;
    if (e.priority === 'High') highPriority++;
  });

  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const stats = [
    { label: 'Total', value: emails.length, color: '#ffffff' },
    { label: 'Unread', value: unread, color: '#fbbf24' },
    { label: 'Need Action', value: actionRequired, color: '#f87171' },
    { label: 'High Priority', value: highPriority, color: '#fb923c' },
  ];

  return (
    <div style={{
      background: 'rgba(30,24,20,0.9)', border: '1px solid rgba(80,70,60,0.4)',
      borderRadius: 12, padding: '14px 16px', marginBottom: 14,
    }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#7d7163', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category chips */}
      <div style={{ borderTop: '1px solid rgba(80,70,60,0.35)', paddingTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#504640', marginRight: 4 }}>Categories:</span>
        {topCats.map(([cat, count]) => {
          const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Personal'];
          return (
            <span key={cat} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: '#b8ae9e',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999, padding: '2px 8px',
            }}>
              {cfg.icon} {cat} <span style={{ color: '#7d7163' }}>({count})</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
