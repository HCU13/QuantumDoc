// FunctionGraph — f(x) denklemlerini ekranda çizer
// react-native-svg kullanır (zaten node_modules'de mevcut)

import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

interface Props {
  expression: string; // örn: "x^2", "2*x + 3", "sin(x)"
  width?: number;
  height?: number;
  modulePrimary?: string;
  textColor?: string;
  bgColor?: string;
}

// Basit güvenli matematiksel değerlendirici
// Sadece temel fonksiyonları destekler — eval kullanmaz
function safeEval(expr: string, x: number): number | null {
  try {
    // Temizle ve dönüştür
    const cleaned = expr
      .toLowerCase()
      .replace(/\^/g, '**')
      .replace(/(\d)(x)/g, '$1*x')     // 2x → 2*x
      .replace(/(x)(\d)/g, 'x*$2')     // x2 → x*2
      .replace(/π/g, String(Math.PI))
      .replace(/pi/g, String(Math.PI));

    // Sadece izin verilen karakterler
    if (!/^[x0-9+\-*/.() \n\t\r**sincostanlgqrep]+$/.test(cleaned)) return null;

    // Math fonksiyonlarını değiştir
    const withMath = cleaned
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(');

    // x yerine değeri koy
    const withX = withMath.replace(/x/g, `(${x})`);

    // eslint-disable-next-line no-new-func
    const result = new Function(`return ${withX}`)();
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

// f(x) ifadesi içeriyor mu?
export function containsFunctionExpression(text: string): string | null {
  // "f(x) = ..." veya "y = ..." veya sadece "x^2 + 2x" gibi ifadeler
  const patterns = [
    /f\s*\(\s*x\s*\)\s*=\s*([^\n]+)/i,
    /y\s*=\s*([^\n,\.]+)/i,
    /=\s*([-\d\s+\-*^/().x]+x[-\d\s+\-*^/().x]*)/i,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const expr = m[1].trim().replace(/\s+/g, '');
      // Geçerli bir x ifadesi mi?
      if (/x/.test(expr) && expr.length < 60) return expr;
    }
  }
  return null;
}

export default function FunctionGraph({
  expression,
  width = 300,
  height = 180,
  modulePrimary = '#8B5CF6',
  textColor = '#6b7280',
  bgColor = 'transparent',
}: Props) {
  const { pathD, xMin, xMax, yMin, yMax } = useMemo(() => {
    const steps = 200;
    const xMin = -5, xMax = 5;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = safeEval(expression, x);
      if (y !== null) points.push({ x, y });
    }

    if (!points.length) return { pathD: '', xMin, xMax, yMin: -5, yMax: 5 };

    const yVals = points.map((p) => p.y);
    let yMin = Math.max(-20, Math.min(...yVals));
    let yMax = Math.min(20, Math.max(...yVals));
    if (yMax - yMin < 0.01) { yMin -= 1; yMax += 1; }

    // Koordinatları SVG piksellerine dönüştür
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

    return { pathD: d, xMin, xMax, yMin, yMax };
  }, [expression, width, height]);

  if (!pathD) return null;

  const pad = 28;
  const toSvgX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const toSvgY = (y: number) => (height - pad) - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);

  const originX = toSvgX(0);
  const originY = toSvgY(0);
  const axisColor = '#d1d5db';
  const gridColor = '#f3f4f6';

  // Grid çizgileri
  const gridXLines = [-4, -3, -2, -1, 1, 2, 3, 4];
  const yStep = Math.ceil((yMax - yMin) / 6);
  const gridYVals = Array.from({ length: 7 }, (_, i) => Math.ceil(yMin) + i * yStep).filter(
    (v) => v > yMin && v < yMax
  );

  return (
    <View>
      <Svg width={width} height={height}>
        {/* Grid */}
        {gridXLines.map((gx) => (
          <Line key={`gx-${gx}`} x1={toSvgX(gx)} y1={pad} x2={toSvgX(gx)} y2={height - pad}
            stroke={gridColor} strokeWidth={1} />
        ))}
        {gridYVals.map((gy) => (
          <Line key={`gy-${gy}`} x1={pad} y1={toSvgY(gy)} x2={width - pad} y2={toSvgY(gy)}
            stroke={gridColor} strokeWidth={1} />
        ))}

        {/* Eksenler */}
        {originY > pad && originY < height - pad && (
          <Line x1={pad} y1={originY} x2={width - pad} y2={originY}
            stroke={axisColor} strokeWidth={1.5} />
        )}
        {originX > pad && originX < width - pad && (
          <Line x1={originX} y1={pad} x2={originX} y2={height - pad}
            stroke={axisColor} strokeWidth={1.5} />
        )}

        {/* Eksen etiketleri */}
        <SvgText x={width - pad + 4} y={originY + 4} fontSize={9} fill={textColor}>x</SvgText>
        <SvgText x={originX + 3} y={pad - 4} fontSize={9} fill={textColor}>y</SvgText>

        {/* Fonksiyon grafiği */}
        <Path d={pathD} stroke={modulePrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Orijin noktası */}
        {originX > pad && originX < width - pad && originY > pad && originY < height - pad && (
          <Circle cx={originX} cy={originY} r={3} fill={modulePrimary} opacity={0.5} />
        )}

        {/* X eksen sayıları */}
        {[-4, -2, 2, 4].map((v) => (
          <SvgText key={v} x={toSvgX(v) - 4} y={(originY > height - pad ? height - pad : originY) + 12}
            fontSize={8} fill={textColor}>{v}</SvgText>
        ))}
      </Svg>

      {/* İfade etiketi */}
      <Text style={{ fontSize: 11, color: modulePrimary, textAlign: 'center', marginTop: -4, fontWeight: '600' }}>
        f(x) = {expression}
      </Text>
    </View>
  );
}
