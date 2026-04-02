/**
 * MathText — Matematiksel ifadeleri güzel Unicode sembollerle gösterir
 *
 * Native Text kullanır (performanslı, offline çalışır)
 * WebView/KaTeX gerektirmez
 *
 * Dönüşümler:
 *   x^2     → x²
 *   x^3     → x³
 *   a^n     → aⁿ
 *   x_1     → x₁
 *   f'(x)   → f′(x)
 *   f''(x)  → f″(x)
 *   sqrt(x) → √x
 *   ->      → →
 *   !=      → ≠
 *   >=      → ≥
 *   <=      → ≤
 *   pi      → π
 *   inf     → ∞
 *   *       → ·  (çarpma)
 */

import React from 'react';
import { Text, TextStyle } from 'react-native';

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

  // f''(x) → f″(x), f'(x) → f′(x)
  result = result.replace(/f''/g, 'f″');
  result = result.replace(/f'/g, 'f′');

  // sqrt(...) → √...
  result = result.replace(/sqrt\(([^)]+)\)/g, '√($1)');
  result = result.replace(/√\(([^)]+)\)/g, '√$1');

  // x^(a-1) → üst simge — parantezli ifadeler
  result = result.replace(/\^(\(([^)]{1,8})\))/g, (_, __, inner) => toSuperscript(inner));

  // x^{abc} — süslü parantezli
  result = result.replace(/\^\{([^}]{1,8})\}/g, (_, inner) => toSuperscript(inner));

  // x^2, x^n — tek karakter veya kısa sayı
  result = result.replace(/\^(-?\d{1,3})/g, (_, n) => toSuperscript(n));
  result = result.replace(/\^([a-zA-Z])/g, (_, c) => toSuperscript(c));

  // Alt indis: x_1, x_n
  result = result.replace(/_\{([^}]{1,6})\}/g, (_, inner) => toSubscript(inner));
  result = result.replace(/_([0-9a-z])/g, (_, c) => toSubscript(c));

  // Kesirler: a/b → a/b (düz bırak, çok sade)

  // Semboller
  result = result.replace(/\b(pi|π)\b/gi, 'π');
  result = result.replace(/\binfinity\b|\binf\b|∞/gi, '∞');
  result = result.replace(/->/g, '→');
  result = result.replace(/!=/g, '≠');
  result = result.replace(/>=/g, '≥');
  result = result.replace(/<=/g, '≤');
  // Çarpma işareti: sadece sayı-sayı arasında * → ·
  result = result.replace(/(\d)\s*\*\s*(\d)/g, '$1·$2');

  return result;
}

interface Props {
  text: string;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
}

export default function MathText({ text, style, numberOfLines }: Props) {
  const formatted = React.useMemo(() => formatMath(text), [text]);
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {formatted}
    </Text>
  );
}
