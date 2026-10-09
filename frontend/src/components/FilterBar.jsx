import { CATEGORY_CONFIG } from '../utils/emailUtils.js';

const categories = ['All', 'Work', 'Personal', 'Finance', 'Promotions', 'Social', 'Updates', 'Spam'];
const priorities  = ['All', 'High', 'Medium', 'Low'];

const PRIORITY_COLORS = {
  High:   { active: { background: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.4)',  color: '#f87171' } },
  Medium: { active: { background: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.4)', color: '#fbbf24' } },
  Low:    { active: { background: 'rgba(107,114,128,0.2)', border: 'rgba(107,114,128,0.35)',color: '#9ca3af' } },
  All:    { active: { background: 'rgba(245,158,11,0.9)',  border: 'transparent',          color: '#1a1512' } },
};

export default function FilterBar({ activeCategory, activePriority, onCategoryChange, onPriorityChange, searchQuery, onSearchChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search by subject, sender, summary..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(30,24,20,0.9)', border: '1px solid rgba(80,70,60,0.4)',
          borderRadius: 10, padding: '9px 14px',
          fontSize: 13, color: '#e8e4dc',
          outline: 'none', marginBottom: 10,
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
        onBlur={e  => e.target.style.borderColor = 'rgba(80,70,60,0.4)'}
      />

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 6, marginBottom: 6 }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const cfg = cat !== 'All' ? CATEGORY_CONFIG[cat] : null;
          return (
            <button key={cat} onClick={() => onCategoryChange(cat)} style={{
              flexShrink: 0, fontSize: 12, padding: '5px 12px', borderRadius: 999, cursor: 'pointer',
              border: isActive ? '1px solid transparent' : '1px solid rgba(80,70,60,0.4)',
              background: isActive ? '#f59e0b' : 'rgba(30,24,20,0.7)',
              color: isActive ? '#1a1512' : '#9a8e7c',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s ease',
            }}>
              {cfg && <span style={{ marginRight: 4 }}>{cfg.icon}</span>}{cat}
            </button>
          );
        })}
      </div>

      {/* Priority tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 11, color: '#504640', marginRight: 4 }}>Priority:</span>
        {priorities.map(pri => {
          const isActive = activePriority === pri;
          const style = isActive ? PRIORITY_COLORS[pri].active : {};
          return (
            <button key={pri} onClick={() => onPriorityChange(pri)} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999, cursor: 'pointer',
              border: isActive ? `1px solid ${style.border}` : '1px solid rgba(80,70,60,0.35)',
              background: isActive ? style.background : 'transparent',
              color: isActive ? style.color : '#7d7163',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s ease',
            }}>
              {pri}
            </button>
          );
        })}
      </div>
    </div>
  );
}
