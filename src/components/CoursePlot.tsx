const WAYPOINTS = [
  { x: 70, y: 60, r: -8, mark: 'x' },
  { x: 105, y: 100, r: 4, mark: 'o' },
  { x: 128, y: 148, r: 14, mark: 'x' },
  { x: 138, y: 200, r: 24, mark: 'o' },
  { x: 150, y: 250, r: 34, mark: '*' },
] as const;

function WaypointMark({ x, y, r, mark }: (typeof WAYPOINTS)[number]) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x={-16} y={-16} width={32} height={32} fill="none" stroke="var(--crt-green)" strokeWidth={1} />
      {mark === 'x' && (
        <path d="M -7 -7 L 7 7 M 7 -7 L -7 7" stroke="var(--crt-green)" strokeWidth={1} />
      )}
      {mark === '*' && (
        <path
          d="M 0 -8 L 0 8 M -8 0 L 8 0 M -6 -6 L 6 6 M 6 -6 L -6 6"
          stroke="var(--crt-green)"
          strokeWidth={1}
        />
      )}
    </g>
  );
}

export function CoursePlot() {
  return (
    <svg viewBox="0 0 400 400" className="crt-glow-text" style={{ width: '100%', height: '100%' }}>
      <g fill="none" stroke="var(--crt-green-dim)" strokeWidth={1}>
        {/* fisheye bowl grid, converging toward bottom-right */}
        <path d="M 400 400 Q 180 380 40 260" />
        <path d="M 400 400 Q 260 340 160 150" />
        <path d="M 400 400 Q 340 250 300 60" />
        <path d="M 400 400 Q 380 150 260 20" />
        <path d="M 30 260 Q 140 220 400 400" />
        <path d="M 40 40 Q 60 220 400 400" />
        <path d="M 200 10 Q 180 220 400 400" />

        {/* nested rotated diamonds, right-center */}
        <g transform="translate(300 200) rotate(45)">
          <rect x={-35} y={-35} width={70} height={70} />
          <rect x={-62} y={-62} width={124} height={124} />
          <rect x={-92} y={-92} width={184} height={184} />
        </g>
      </g>

      {/* course waypoint chain */}
      <path
        d="M 70 60 Q 95 90 105 100 T 128 148 Q 132 175 138 200 T 150 250 Q 165 275 190 285 Q 210 292 205 275"
        fill="none"
        stroke="var(--crt-green)"
        strokeWidth={1}
        strokeDasharray="2 4"
      />
      {WAYPOINTS.map((wp) => (
        <WaypointMark key={`${wp.x}-${wp.y}`} {...wp} />
      ))}

      {/* corner crosshairs */}
      {[
        [12, 12],
        [388, 12],
        [12, 388],
        [388, 388],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`} stroke="var(--crt-green-dim)">
          <line x1={cx - 7} y1={cy} x2={cx + 7} y2={cy} />
          <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 7} />
        </g>
      ))}
    </svg>
  );
}
