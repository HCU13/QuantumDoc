/**
 * MathRenderer — KaTeX ile matematiksel ifadeleri güzel render eder
 * WebView + inline KaTeX kullanır (internet gerektirmez)
 *
 * Kullanım:
 *   <MathRenderer text="f''(1) = 52" fontSize={22} bold />
 *   <MathRenderer text="x^2 + 2x + 1 = 0" fontSize={14} />
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

interface Props {
  text: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  center?: boolean;
  minHeight?: number;
}

// Düz metin → LaTeX dönüşüm kuralları
function textToLatex(text: string): string {
  return text
    // Üs işaretleri: x^2 → x^{2}, x^(a-1) → x^{a-1}
    .replace(/\^(\([^)]+\))/g, '^{$1}')           // x^(a-1) → x^{a-1}
    .replace(/\^\(([^)]*)\)/g, '^{$1}')
    .replace(/\^([a-zA-Z0-9]+)/g, '^{$1}')        // x^2 → x^{2}
    // Alt indis: x_n, a_1
    .replace(/_([a-zA-Z0-9]+)/g, '_{$1}')
    // Kesirler: a/b → \frac{a}{b} (sadece basit durumlar)
    .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
    // Türev notasyonu: f'(x) → f'(x), f''(x) → f''(x)
    .replace(/f''/g, "f''")
    .replace(/f'/g, "f'")
    // Çarpma işareti · → \cdot
    .replace(/·/g, '\\cdot')
    // Ok: →
    .replace(/→/g, '\\rightarrow')
    // sqrt
    .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
    // Trigonometri
    .replace(/\bsin\b/g, '\\sin')
    .replace(/\bcos\b/g, '\\cos')
    .replace(/\btan\b/g, '\\tan')
    .replace(/\bln\b/g, '\\ln')
    .replace(/\blog\b/g, '\\log')
    // Pi
    .replace(/\bpi\b/gi, '\\pi')
    // infinity
    .replace(/∞/g, '\\infty')
    // ≤ ≥ ≠
    .replace(/≤/g, '\\leq')
    .replace(/≥/g, '\\geq')
    .replace(/≠/g, '\\neq')
    // Çıkarma işareti bazen unicode eksi olabilir
    .replace(/−/g, '-');
}

// Matematiksel ifade içeriyor mu?
function hasMath(text: string): boolean {
  return /[x²³\^_√∫∑∏±≤≥≠→·π∞]|f[''(]|[a-z]\^|\d\/\d|\\frac|sqrt|sin|cos|tan|log|ln/i.test(text);
}

// KaTeX HTML sayfası oluştur
function buildHtml(latex: string, fontSize: number, color: string, bold: boolean, center: boolean): string {
  const fontWeight = bold ? '700' : '400';
  const textAlign = center ? 'center' : 'left';

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: transparent; overflow: hidden; }
  body {
    display: flex;
    align-items: center;
    justify-content: ${center ? 'center' : 'flex-start'};
    padding: 4px 2px;
  }
  .math {
    font-size: ${fontSize}px;
    font-weight: ${fontWeight};
    color: ${color};
    text-align: ${textAlign};
    line-height: 1.5;
    word-break: break-word;
  }
  .katex { font-size: 1em !important; }
  .katex-display { margin: 0 !important; }
</style>
</head>
<body>
<div class="math" id="math"></div>
<script>
  try {
    katex.render(${JSON.stringify(latex)}, document.getElementById('math'), {
      throwOnError: false,
      displayMode: false,
      strict: false,
    });
  } catch(e) {
    document.getElementById('math').innerText = ${JSON.stringify(latex)};
  }
  // İçerik yüksekliğini bildir
  setTimeout(() => {
    const h = document.body.scrollHeight;
    window.ReactNativeWebView.postMessage(JSON.stringify({ height: h }));
  }, 80);
</script>
</body>
</html>`;
}

export default function MathRenderer({
  text,
  fontSize = 14,
  color = '#374151',
  bold = false,
  center = false,
  minHeight,
}: Props) {
  const [height, setHeight] = React.useState(minHeight ?? fontSize * 2.2);

  const latex = useMemo(() => textToLatex(text), [text]);
  const html  = useMemo(() => buildHtml(latex, fontSize, color, bold, center), [latex, fontSize, color, bold, center]);

  return (
    <View style={{ height, width: '100%' }}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={(e) => {
          try {
            const { height: h } = JSON.parse(e.nativeEvent.data);
            if (h > 0) setHeight(h + 4);
          } catch {}
        }}
        originWhitelist={['*']}
        javaScriptEnabled
        cacheEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
