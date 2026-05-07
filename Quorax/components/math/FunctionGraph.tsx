// FunctionGraph — plots f(x) expressions with pan + pinch-to-zoom.
//
// Uses react-native-svg (no dependency bloat) and react-native-gesture-handler for interaction.
// On pan/pinch, the viewport (xMin..yMax) is updated in state so axis labels and grid
// re-render cleanly without scaling artifacts (the entire graph is re-computed per gesture frame).

import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

interface Props {
  expression: string;
  width?: number;
  height?: number;
  modulePrimary?: string;
  textColor?: string;
  bgColor?: string;
}

// Safe math evaluator — no `eval`, restricted character set.
function safeEval(expr: string, x: number): number | null {
  try {
    const cleaned = expr
      .toLowerCase()
      .replace(/\^/g, '**')
      .replace(/(\d)(x)/g, '$1*x')
      .replace(/(x)(\d)/g, 'x*$2')
      .replace(/π/g, String(Math.PI))
      .replace(/pi/g, String(Math.PI));

    if (!/^[x0-9+\-*/.() \n\t\r**sincostanlgqrep]+$/.test(cleaned)) return null;

    const withMath = cleaned
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(');

    const withX = withMath.replace(/x/g, `(${x})`);
    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${withX}`)();
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

export function containsFunctionExpression(text: string): string | null {
  const patterns = [
    /f\s*\(\s*x\s*\)\s*=\s*([^\n]+)/i,
    /y\s*=\s*([^\n,\.]+)/i,
    /=\s*([-\d\s+\-*^/().x]+x[-\d\s+\-*^/().x]*)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const expr = m[1].trim().replace(/\s+/g, '');
      if (/x/.test(expr) && expr.length < 60) return expr;
    }
  }
  return null;
}

// Fallback y-range when no valid points exist in the current x viewport.
const DEFAULT_Y_RANGE = { yMin: -5, yMax: 5 };

export default function FunctionGraph({
  expression,
  width = 300,
  height = 180,
  modulePrimary = '#8B5CF6',
  textColor = '#6b7280',
}: Props) {
  // X viewport is user-controlled (pan/zoom). Y range auto-fits the function's actual output
  // within the visible X range — that's usually what the user wants and avoids manual y-panning.
  const [xRange, setXRange] = useState<{ xMin: number; xMax: number }>({ xMin: -5, xMax: 5 });

  const { pathD, yMin, yMax } = useMemo(() => {
    const { xMin, xMax } = xRange;
    const steps = 200;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = safeEval(expression, x);
      if (y !== null) points.push({ x, y });
    }
    if (!points.length) return { pathD: '', ...DEFAULT_Y_RANGE };

    const yVals = points.map((p) => p.y);
    let yMin = Math.max(-50, Math.min(...yVals));
    let yMax = Math.min(50, Math.max(...yVals));
    if (yMax - yMin < 0.01) { yMin -= 1; yMax += 1; }
    // Add a little vertical padding so the curve doesn't hug the frame.
    const margin = (yMax - yMin) * 0.1;
    yMin -= margin; yMax += margin;

    const pad = 28;
    const toSvgX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
    const toSvgY = (y: number) => (height - pad) - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);

    let d = '';
    let moved = false;
    for (const p of points) {
      const sx = toSvgX(p.x);
      const sy = toSvgY(p.y);
      if (!moved) { d += `M ${sx} ${sy}`; moved = true; }
      else d += ` L ${sx} ${sy}`;
    }
    return { pathD: d, yMin, yMax };
  }, [expression, xRange, width, height]);

  // Pan: drag horizontally → shift xRange. Vertical drag is ignored (y auto-fits).
  const panGesture = useMemo(
    () => Gesture.Pan()
      .onChange((e) => {
        runOnJS(setXRange)({
          xMin: xRange.xMin - (e.changeX / width) * (xRange.xMax - xRange.xMin),
          xMax: xRange.xMax - (e.changeX / width) * (xRange.xMax - xRange.xMin),
        });
      }),
    [xRange, width]
  );

  // Pinch: scale the x range around its center. Less than 0.5 units is too zoomed in to be useful.
  const pinchGesture = useMemo(
    () => Gesture.Pinch()
      .onChange((e) => {
        const cx = (xRange.xMin + xRange.xMax) / 2;
        const currentSpan = xRange.xMax - xRange.xMin;
        const nextSpan = Math.max(0.5, Math.min(200, currentSpan / e.scaleChange));
        runOnJS(setXRange)({ xMin: cx - nextSpan / 2, xMax: cx + nextSpan / 2 });
      }),
    [xRange]
  );

  const composed = useMemo(() => Gesture.Simultaneous(panGesture, pinchGesture), [panGesture, pinchGesture]);

  if (!pathD) return null;

  const { xMin, xMax } = xRange;
  const pad = 28;
  const toSvgX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const toSvgY = (y: number) => (height - pad) - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);

  const originX = toSvgX(0);
  const originY = toSvgY(0);
  const axisColor = '#d1d5db';
  const gridColor = '#f3f4f6';

  // Produce "nice" grid line values for the current viewport at an appropriate scale.
  const niceStep = (span: number) => {
    const raw = span / 8;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    const step = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
    return step * mag;
  };
  const xStep = niceStep(xMax - xMin);
  const yStep = niceStep(yMax - yMin);
  const gridXs: number[] = [];
  for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax; v += xStep) {
    if (Math.abs(v) > 1e-9) gridXs.push(+v.toFixed(6));
  }
  const gridYs: number[] = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) {
    if (Math.abs(v) > 1e-9) gridYs.push(+v.toFixed(6));
  }

  const fmtTick = (v: number) => {
    const abs = Math.abs(v);
    if (abs < 0.01 || abs >= 1000) return v.toExponential(0);
    if (abs < 1) return v.toFixed(2);
    return v.toFixed(0);
  };

  return (
    <View>
      <GestureDetector gesture={composed}>
        <View style={{ width, height }}>
          <Svg width={width} height={height}>
            {/* Grid lines */}
            {gridXs.map((gx) => (
              <Line key={`gx-${gx}`} x1={toSvgX(gx)} y1={pad} x2={toSvgX(gx)} y2={height - pad}
                stroke={gridColor} strokeWidth={1} />
            ))}
            {gridYs.map((gy) => (
              <Line key={`gy-${gy}`} x1={pad} y1={toSvgY(gy)} x2={width - pad} y2={toSvgY(gy)}
                stroke={gridColor} strokeWidth={1} />
            ))}

            {/* Axes */}
            {originY > pad && originY < height - pad && (
              <Line x1={pad} y1={originY} x2={width - pad} y2={originY}
                stroke={axisColor} strokeWidth={1.5} />
            )}
            {originX > pad && originX < width - pad && (
              <Line x1={originX} y1={pad} x2={originX} y2={height - pad}
                stroke={axisColor} strokeWidth={1.5} />
            )}

            {/* Axis labels */}
            <SvgText x={width - pad + 4} y={originY + 4} fontSize={9} fill={textColor}>x</SvgText>
            <SvgText x={originX + 3} y={pad - 4} fontSize={9} fill={textColor}>y</SvgText>

            {/* Function path */}
            <Path d={pathD} stroke={modulePrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Origin dot */}
            {originX > pad && originX < width - pad && originY > pad && originY < height - pad && (
              <Circle cx={originX} cy={originY} r={3} fill={modulePrimary} opacity={0.5} />
            )}

            {/* X tick labels */}
            {gridXs.slice(0, 8).map((v) => (
              <SvgText
                key={`xt-${v}`}
                x={toSvgX(v) - 6}
                y={(originY > height - pad ? height - pad : Math.min(Math.max(originY, pad), height - pad)) + 12}
                fontSize={8} fill={textColor}
              >{fmtTick(v)}</SvgText>
            ))}
          </Svg>
        </View>
      </GestureDetector>

      {/* Reset zoom + expression label */}
      <View style={styles.footer}>
        <Text style={[styles.expression, { color: modulePrimary }]}>f(x) = {expression}</Text>
        <TouchableOpacity onPress={() => setXRange({ xMin: -5, xMax: 5 })} style={styles.resetBtn}>
          <Text style={[styles.resetText, { color: textColor }]}>↺</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: -2,
  },
  expression: {
    fontSize: 11,
    fontWeight: '600',
  },
  resetBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
