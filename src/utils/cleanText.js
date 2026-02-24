/**
 * Lightly cleans extracted text by removing lines that are purely code syntax.
 * Only strips obvious code-only lines (braces, #include, etc).
 * If filtering removes too much, falls back to showing the original text.
 */
export function cleanExtractedText(text) {
  if (!text) return text;

  const lines = text.split('\n');

  // Only match lines that are PURELY code syntax with no readable explanation
  const pureCodePatterns = [
    /^\s*[{}()]\s*$/,                  // lines that are just { } ( )
    /^\s*#\s*include\s*<.*>/,          // #include <stdio.h>
    /^\s*#\s*define\b/,                // #define
    /^\s*using\s+namespace\b/,         // using namespace std;
    /^\s*\/\/[^a-zA-Z]*$/,            // comments with no words like // ---
    /^\s*\/\*\s*$/,                   // just /*
    /^\s*\*\/\s*$/,                   // just */
  ];

  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed === '') return true;
    return !pureCodePatterns.some(pattern => pattern.test(trimmed));
  });

  const cleaned = filtered
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // If we removed more than 70% of content, just show original text
  if (cleaned.length < text.trim().length * 0.3) {
    return text.trim();
  }

  return cleaned || text.trim();
}
