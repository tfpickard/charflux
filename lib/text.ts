/**
 * Default text configuration
 *
 * MAX_CHARS: Controls the maximum number of characters used in the simulation.
 * Adjust this to balance visual density vs performance.
 */
export const MAX_CHARS = 3000;

/**
 * Default text source - a simple public domain text
 * You can replace this with any public domain text you prefer.
 */
export const DEFAULT_TEXT = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow.

In the beginning was the Word, and the Word was with rhythm, and the Word was rhythm. Every letter carries weight, every character has mass. A dances lightly, Z stomps heavily. Punctuation marks pause and punctuate the flow.

Numbers too have their place: 1234567890. Mathematical symbols add flavor: + - * / = < >. Brackets embrace: () [] {}. Special characters spice things up: ! @ # $ % ^ & * ~

The simulation transforms text into motion. Characters become particles. ASCII values become forces. Similar letters attract, different letters repel. Watch them dance and swirl in perpetual motion.

This is a canvas of moving type, a fluid of glyphs, a symphony of symbols. Every refresh creates new patterns, new emergent behaviors. The alphabet becomes alive, dancing to the rhythm of computational physics.

Welcome to the ASCII Fluid Lab, where text transcends its static nature and flows like water, swirls like smoke, and dances like fire. Type is no longer bound to the page - it floats, it flows, it finds its own path through the digital ether.`;

/**
 * Sanitizes and limits text to MAX_CHARS
 */
export function sanitizeText(text: string): string {
  // Remove excessive whitespace while preserving some structure
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Limit to MAX_CHARS
  return cleaned.slice(0, MAX_CHARS);
}

/**
 * Gets the default text, pre-sanitized
 */
export function getDefaultText(): string {
  return sanitizeText(DEFAULT_TEXT);
}
