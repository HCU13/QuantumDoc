/**
 * MathSymbolBar — Horizontal scroll bar that inserts math symbols into a text input.
 *
 * UX principle: WYSIWYG. The key label is exactly what gets inserted. No LaTeX commands
 * (\sqrt, \frac) leak into the user-facing input — those are reserved for AI output.
 *
 * Templates (√, log, lim) insert with parentheses and place the caret between them so the
 * user can immediately type the radicand/argument — a common textbox affordance.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SymbolDef {
  // Display label — exactly what the user sees on the key.
  label: string;
  // Text inserted at the caret. Use `|` to mark where the caret should land after insertion;
  // omit for symbols that don't need re-focusing.
  insert: string;
  // When true, the symbol is a modifier (super/subscript) that needs a base variable when
  // the caret is at start-of-input or after a space/operator. In that case we prepend `x`.
  modifier?: boolean;
}

const SYMBOLS: SymbolDef[] = [
  // Powers and roots — modifiers that prepend `x` when inserted with no base in front.
  { label: 'x²',  insert: '²',  modifier: true },
  { label: 'x³',  insert: '³',  modifier: true },
  { label: 'xⁿ',  insert: '^n', modifier: true },
  { label: 'x₁',  insert: '₁',  modifier: true },
  { label: 'xₙ',  insert: '_n', modifier: true },
  { label: '√',   insert: '√(|)' },
  { label: 'a/b', insert: '(|)/()' },

  // Greek & constants
  { label: 'π',   insert: 'π' },
  { label: 'e',   insert: 'e' },
  { label: '∞',   insert: '∞' },
  { label: '°',   insert: '°' },

  // Operators
  { label: '±',   insert: '±' },
  { label: '·',   insert: '·' },
  { label: '÷',   insert: '÷' },
  { label: '≤',   insert: '≤' },
  { label: '≥',   insert: '≥' },
  { label: '≠',   insert: '≠' },

  // Calculus
  { label: '∫',   insert: '∫' },
  { label: 'Σ',   insert: 'Σ' },
  { label: '∂',   insert: '∂' },
  { label: 'lim', insert: 'lim(|)' },

  // Transcendental
  { label: 'log', insert: 'log(|)' },
  { label: 'ln',  insert: 'ln(|)' },
  { label: 'sin', insert: 'sin(|)' },
  { label: 'cos', insert: 'cos(|)' },
  { label: 'tan', insert: 'tan(|)' },

  // Greek letters
  { label: 'α',   insert: 'α' },
  { label: 'β',   insert: 'β' },
  { label: 'θ',   insert: 'θ' },

  // Grouping
  { label: '()',  insert: '(|)' },
  { label: '[]',  insert: '[|]' },
];

interface Props {
  value: string;
  selection: { start: number; end: number };
  onChange: (nextText: string, nextCaret: number) => void;
  accentColor?: string;
  backgroundColor?: string;
  keyColor?: string;
  textColor?: string;
}

export default function MathSymbolBar({
  value,
  selection,
  onChange,
  accentColor = '#7C3AED',
  backgroundColor = '#F3F4F6',
  keyColor = '#FFFFFF',
  textColor = '#111827',
}: Props) {
  const handleInsert = (def: SymbolDef) => {
    const { start, end } = selection;
    let raw = def.insert;

    // For modifier keys (x², x³, xⁿ, x₁, xₙ): if the caret isn't right after a letter/digit,
    // prepend `x` so the user ends up with `x²` instead of a dangling `²`. Matches the key label.
    if (def.modifier) {
      const prevChar = value.slice(0, start).slice(-1);
      const needsBase = !/[a-zA-Z0-9_()\]]/.test(prevChar);
      if (needsBase) raw = 'x' + raw;
    }

    const caretMarkerIdx = raw.indexOf('|');
    const insert = caretMarkerIdx >= 0 ? raw.replace('|', '') : raw;
    const next = value.slice(0, start) + insert + value.slice(end);
    const caretPos = caretMarkerIdx >= 0 ? start + caretMarkerIdx : start + insert.length;
    onChange(next, caretPos);
  };

  return (
    <View style={[styles.wrap, { backgroundColor }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
      >
        {SYMBOLS.map((def) => (
          <TouchableOpacity
            key={def.label}
            onPress={() => handleInsert(def)}
            style={[styles.key, { backgroundColor: keyColor, borderColor: accentColor + '22' }]}
            activeOpacity={0.6}
          >
            <Text style={[styles.keyText, { color: textColor }]}>{def.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 6 },
  content: { gap: 6, paddingHorizontal: 8 },
  key: {
    minWidth: 40,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  keyText: { fontSize: 14, fontWeight: '600' },
});
