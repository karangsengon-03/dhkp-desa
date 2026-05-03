'use client';

/** SectionHeader — shared header dengan ikon bulat untuk setiap section pengaturan */
export function SectionHeader({
  icon,
  iconBg,
  title,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="section-header">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-md)',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--c-text-1)' }}>
          {title}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 2 }}>
          {sub}
        </div>
      </div>
    </div>
  );
}
