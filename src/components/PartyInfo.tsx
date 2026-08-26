const INFO_ITEMS = [
  { label: 'DATE', value: '2026.10.31', sub: '토요일 저녁', valueFont: 'pixel' as const },
  { label: 'LOCATION', value: '사당역', sub: '장소 추후 공지', valueFont: 'sans' as const },
  { label: 'FEE', value: '30,000원', sub: '포틀럭 포함', valueFont: 'sans' as const },
];

export function PartyInfo() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4" aria-label="파티 정보">
      <h2
        className="font-pixel text-center glow-orange"
        style={{ fontSize: '14px', color: '#FF7A00', textShadow: '0 0 10px #FF7A00', marginBottom: '32px' }}
      >
        PARTY INFO
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
        }}
      >
        {INFO_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              background: '#1A1026',
              border: '1px solid #5B2A86',
              borderTop: '3px solid #FF7A00',
              boxShadow: '0 10px 24px rgba(0,0,0,.4)',
              padding: '22px 20px',
            }}
          >
            <div
              className="font-sans"
              style={{ fontSize: '14px', color: '#8B4BC0', letterSpacing: '.08em', marginBottom: '10px' }}
            >
              {item.label}
            </div>
            {item.valueFont === 'pixel' ? (
              <div
                className="font-pixel"
                style={{ fontSize: '15px', color: '#EDE7F6', marginBottom: '6px' }}
              >
                {item.value}
              </div>
            ) : (
              <div
                className="font-sans"
                style={{ fontSize: '22px', color: '#EDE7F6', marginBottom: '6px' }}
              >
                {item.value}
              </div>
            )}
            <div
              className="font-sans"
              style={{ fontSize: '13px', color: '#8B4BC0' }}
            >
              {item.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
