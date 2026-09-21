const PARTY = ['#00f2fe', '#8b5cf6', '#fbbf24', '#38bdf8', '#a78bfa', '#f59e0b'];
const DIM = '#2a3548';

type Seat = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  lit: boolean;
  delay: number;
};

function buildSeats(): Seat[] {
  const seats: Seat[] = [];
  const rows = 10;
  const originX = 50;
  const originY = 96;
  let n = 0;

  for (let row = 0; row < rows; row++) {
    const count = 16 + row * 5;
    const radius = 16 + row * 7.4;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = Math.PI + t * Math.PI;
      const lit = (n + row * 3) % 4 === 0;
      seats.push({
        cx: originX + Math.cos(angle) * radius,
        cy: originY + Math.sin(angle) * radius * 0.68,
        r: 0.62 + row * 0.04,
        fill: lit ? PARTY[n % PARTY.length] : DIM,
        lit,
        delay: (n % 14) * 0.4,
      });
      n += 1;
    }
  }

  return seats;
}

const SEATS = buildSeats();

export function HeroBackdrop() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-cyber-950" />

      <div className="absolute -top-24 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-tech-cyan/10 blur-3xl" />
      <div className="absolute top-1/3 right-[-8%] h-[32rem] w-[32rem] rounded-full bg-neural-medium/16 blur-3xl" />
      <div className="absolute bottom-[-8%] left-1/3 h-80 w-80 rounded-full bg-ethics-amber/10 blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 242, 254, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 242, 254, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at 70% 80%, black 10%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 70% 80%, black 10%, transparent 72%)',
        }}
      />

      <svg
        className="absolute inset-x-0 bottom-[-6%] h-[78%] w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <radialGradient id="chamber-glow" cx="50%" cy="92%" r="55%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
            <stop offset="45%" stopColor="#00f2fe" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#070a11" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="50" cy="96" rx="48" ry="18" fill="url(#chamber-glow)" />

        <path
          d="M 8 96 A 42 42 0 0 1 92 96"
          fill="none"
          stroke="rgba(0, 242, 254, 0.12)"
          strokeWidth="0.15"
        />

        {SEATS.map((seat, i) => (
          <circle
            key={i}
            cx={seat.cx}
            cy={seat.cy}
            r={seat.r}
            fill={seat.fill}
            className={seat.lit ? 'hero-seat-lit' : 'hero-seat-dim'}
            style={seat.lit ? { animationDelay: `${seat.delay}s` } : undefined}
          />
        ))}
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-cyber-950 via-cyber-950/35 to-cyber-950/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyber-950/45 via-transparent to-cyber-950/25" />
    </div>
  );
}
