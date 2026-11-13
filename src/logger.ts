const REDACTED_KEYS = new Set([
  "cardnumber",
  "pan",
  "cvv",
  "cvc",
  "email",
  "customeremail",
  "authorization",
  "password",
]);

type Fields = Record<string, unknown>;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Fields = {};
    for (const [key, v] of Object.entries(value as Fields)) {
      out[key] = REDACTED_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : redact(v);
    }
    return out;
  }
  return value;
}

export const logger = {
  info(event: string, fields: Fields = {}): void {
    if (process.env.NODE_ENV === "test") return;
    console.log(JSON.stringify({ level: "info", event, ...(redact(fields) as Fields) }));
  },
  warn(event: string, fields: Fields = {}): void {
    if (process.env.NODE_ENV === "test") return;
    console.warn(JSON.stringify({ level: "warn", event, ...(redact(fields) as Fields) }));
  },
};
