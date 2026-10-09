export default function SkeletonEmail() {
  return (
    <div style={{
      background: 'rgba(30,24,20,0.9)', border: '1px solid rgba(80,70,60,0.4)',
      borderRadius: 12, padding: '14px 16px', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(80,70,60,0.5)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ height: 12, width: 120, background: 'rgba(80,70,60,0.5)', borderRadius: 6 }} />
            <div style={{ height: 10, width: 50,  background: 'rgba(80,70,60,0.4)', borderRadius: 6 }} />
          </div>
          <div style={{ height: 13, width: '75%', background: 'rgba(80,70,60,0.5)', borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 10, width: '100%', background: 'rgba(80,70,60,0.3)', borderRadius: 6, marginBottom: 5 }} />
          <div style={{ height: 10, width: '85%',  background: 'rgba(80,70,60,0.3)', borderRadius: 6, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ height: 20, width: 70, background: 'rgba(80,70,60,0.4)', borderRadius: 999 }} />
            <div style={{ height: 20, width: 55, background: 'rgba(80,70,60,0.4)', borderRadius: 999 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
