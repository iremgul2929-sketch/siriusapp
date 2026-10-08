import Svg, { Circle, Line } from 'react-native-svg';
import type { Landmark } from '@/ml/types';
import { theme } from '@/constants/theme';

const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

export function HandOverlay({ points }: { points: Landmark[] }) {
  if (points.length === 0) return null;

  return (
    <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} viewBox="0 0 1 1">
      {CONNECTIONS.map(([a, b], i) =>
        points[a] && points[b] ? (
          <Line
            key={i}
            x1={points[a].x}
            y1={points[a].y}
            x2={points[b].x}
            y2={points[b].y}
            stroke={theme.color.accent}
            strokeWidth={0.004}
          />
        ) : null,
      )}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={0.006} fill={theme.color.accent} />
      ))}
    </Svg>
  );
}
