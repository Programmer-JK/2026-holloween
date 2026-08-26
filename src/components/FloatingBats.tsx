import { Bat } from './Bat';

const BATS = [
  { id: 1, top: '15%', anim: 'batFly', duration: '14s', delay: '0s' },
  { id: 2, top: '40%', anim: 'batFly2', duration: '18s', delay: '5s' },
  { id: 3, top: '62%', anim: 'batFly', duration: '22s', delay: '11s' },
];

export function FloatingBats() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
      {BATS.map((bat) => (
        <div
          key={bat.id}
          style={{
            position: 'absolute',
            top: bat.top,
            left: 0,
            animation: `${bat.anim} ${bat.duration} linear ${bat.delay} infinite`,
          }}
        >
          <Bat size={40} />
        </div>
      ))}
    </div>
  );
}
