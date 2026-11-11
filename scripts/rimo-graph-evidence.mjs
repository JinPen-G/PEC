export function rimoGraphQuote(markdown, quote) {
  for (const candidate of new Set([quote, quote.replace(/\r?\n/g, '\r\n'), quote.replace(/\r\n/g, '\n')])) {
    const position = markdown.indexOf(candidate);
    if (candidate && position >= 0) return { quote: candidate, position };
  }
  throw new Error(`Graph quote missing: ${quote}`);
}
