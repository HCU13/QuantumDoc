/**
 * MathText — Renders math expressions with progressive quality.
 *
 * Strategy:
 *   1. If the text contains complex LaTeX tokens (\frac, \int, \sum, \sqrt, \begin, _{}, ^{} with nesting, etc.)
 *      it is rendered with KaTeX via react-native-katex (WebView-based, competitor-grade typography).
 *   2. Otherwise the cheap Unicode formatter is used (x^2 → x², pi → π, etc.) — fast, offline, no WebView.
 *
 * This keeps simple steps snappy while giving complex expressions the proper mathematical typography
 * that users expect from a solver (fractions with bar, integral bounds, square root overbar, matrices).
 */

import React from 'react';
import { Text, TextStyle, View, StyleSheet } from 'react-native';
import KaTeX from 'react-native-katex';

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
  'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
  'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
  'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
  'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
  '+': '⁺', '-': '⁻', '(': '⁽', ')': '⁾',
};

const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'a': 'ₐ', 'e': 'ₑ', 'i': 'ᵢ', 'n': 'ₙ', 'o': 'ₒ',
  'r': 'ᵣ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ',
};

function toSuperscript(s: string): string {
  return s.split('').map(c => SUPERSCRIPTS[c] ?? c).join('');
}

function toSubscript(s: string): string {
  return s.split('').map(c => SUBSCRIPTS[c] ?? c).join('');
}

export function formatMath(text: string): string {
  let result = text;

  result = result.replace(/f''/g, 'f″');
  result = result.replace(/f'/g, 'f′');

  result = result.replace(/sqrt\(([^)]+)\)/g, '√($1)');
  result = result.replace(/√\(([^)]+)\)/g, '√$1');

  result = result.replace(/\^(\(([^)]{1,8})\))/g, (_, __, inner) => toSuperscript(inner));
  result = result.replace(/\^\{([^}]{1,8})\}/g, (_, inner) => toSuperscript(inner));
  result = result.replace(/\^(-?\d{1,3})/g, (_, n) => toSuperscript(n));
  result = result.replace(/\^([a-zA-Z])/g, (_, c) => toSuperscript(c));

  result = result.replace(/_\{([^}]{1,6})\}/g, (_, inner) => toSubscript(inner));
  result = result.replace(/_([0-9a-z])/g, (_, c) => toSubscript(c));

  result = result.replace(/\b(pi|π)\b/gi, 'π');
  result = result.replace(/\binfinity\b|\binf\b|∞/gi, '∞');
  result = result.replace(/->/g, '→');
  result = result.replace(/!=/g, '≠');
  result = result.replace(/>=/g, '≥');
  result = result.replace(/<=/g, '≤');
  result = result.replace(/(\d)\s*\*\s*(\d)/g, '$1·$2');

  return result;
}

// Complex LaTeX tokens that Unicode formatting can't render properly.
// When any of these appear, we defer to KaTeX.
const COMPLEX_LATEX_RE =
  /\\(frac|int|sum|prod|sqrt|lim|begin|end|binom|cases|matrix|pmatrix|bmatrix|vmatrix|overline|underline|vec|hat|bar|dot|ddot|tilde|mathbb|mathcal|mathrm|mathbf|left|right)\b/;

export function hasComplexLatex(text: string): boolean {
  return COMPLEX_LATEX_RE.test(text);
}

// Strip $...$ / $$...$$ wrappers that the model may emit so KaTeX receives raw LaTeX.
function stripMathDelimiters(text: string): string {
  return text
    .replace(/^\$\$([\s\S]*)\$\$$/, '$1')
    .replace(/^\$([\s\S]*)\$$/, '$1')
    .trim();
}

interface Props {
  text: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
  // When true, forces KaTeX rendering regardless of content (useful for the main answer box).
  forceLatex?: boolean;
}

// Extract the numeric font size from a possibly-array style so we can pass it to KaTeX.
function extractFontSize(style: TextStyle | TextStyle[] | undefined): number {
  if (!style) return 16;
  const styles = Array.isArray(style) ? style : [style];
  for (const s of styles) {
    if (s && typeof s.fontSize === 'number') return s.fontSize;
  }
  return 16;
}

function extractColor(style: TextStyle | TextStyle[] | undefined): string {
  if (!style) return '#000';
  const styles = Array.isArray(style) ? style : [style];
  for (let i = styles.length - 1; i >= 0; i--) {
    const s = styles[i];
    if (s && typeof s.color === 'string') return s.color;
  }
  return '#000';
}

export default function MathText({ text, style, numberOfLines, forceLatex }: Props) {
  const useLatex = forceLatex || hasComplexLatex(text);

  if (useLatex) {
    const expression = stripMathDelimiters(text);
    const fontSize = extractFontSize(style);
    const color = extractColor(style);
    // KaTeX's inline style targets its WebView container (ViewStyle) — text color is piped through
    // `inlineStyle` CSS (KaTeX renders HTML internally), so we inject both the container box size
    // and a CSS snippet for the typeset text color.
    const katexInlineStyle = `html, body { color: ${color}; font-size: ${fontSize}px; margin: 0; padding: 0; }`;
    return (
      <View style={[styles.katexContainer, { minHeight: fontSize * 2.2 }]}>
        <KaTeX
          expression={expression}
          displayMode={true}
          throwOnError={false}
          errorColor="#ef4444"
          macros={{}}
          inlineStyle={katexInlineStyle}
          style={styles.katexWebView}
        />
      </View>
    );
  }

  const formatted = React.useMemo(() => formatMath(text), [text]);
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  katexContainer: {
    width: '100%',
  },
  katexWebView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});
