const THAI_LEADING_VOWELS = new Set(["เ", "แ", "โ", "ใ", "ไ"]);

function firstLetter(word: string): string {
  const chars = Array.from(word);
  const letter = chars.find((char) => !THAI_LEADING_VOWELS.has(char)) ?? chars[0] ?? "";
  return letter.toUpperCase();
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return firstLetter(words[0]);
  return firstLetter(words[0]) + firstLetter(words[1]);
}

// hash คงที่ของชื่อ ใช้เลือกสีของ Avatar
export function hashName(name: string, buckets: number): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 1_000_003;
  return hash % buckets;
}
