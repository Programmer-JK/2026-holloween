export function PixelBackground() {
  // Stars at fixed positions for deterministic rendering
  const stars = [
    { x: '8%', y: '12%', size: 2, delay: '0s', duration: '3s' },
    { x: '23%', y: '7%', size: 1, delay: '0.5s', duration: '2.5s' },
    { x: '45%', y: '18%', size: 2, delay: '1s', duration: '4s' },
    { x: '67%', y: '5%', size: 1, delay: '1.5s', duration: '2s' },
    { x: '82%', y: '14%', size: 2, delay: '0.8s', duration: '3.5s' },
    { x: '91%', y: '9%', size: 1, delay: '2s', duration: '3s' },
    { x: '15%', y: '25%', size: 1, delay: '0.3s', duration: '4.5s' },
    { x: '55%', y: '30%', size: 2, delay: '1.2s', duration: '2.8s' },
    { x: '78%', y: '22%', size: 1, delay: '0.7s', duration: '3.2s' },
    { x: '35%', y: '40%', size: 1, delay: '1.8s', duration: '2.2s' },
    { x: '92%', y: '35%', size: 2, delay: '0.4s', duration: '4s' },
    { x: '5%', y: '50%', size: 1, delay: '2.2s', duration: '3.8s' },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Gradient background layers */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 10%, rgba(91,42,134,0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(255,122,0,0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 90%, rgba(91,42,134,0.15) 0%, transparent 50%)
          `,
        }}
      />

      {/* Pixel stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute bg-[#EDE7F6] animate-twinkle"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      {/* Ground tombstones (bottom decorative) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end px-4 opacity-20">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="bg-[#5B2A86]"
              style={{
                width: i % 2 === 0 ? '24px' : '20px',
                height: i % 2 === 0 ? '36px' : '28px',
                borderRadius: '50% 50% 0 0',
              }}
            />
            <div
              className="bg-[#5B2A86]"
              style={{
                width: i % 2 === 0 ? '28px' : '24px',
                height: '8px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
