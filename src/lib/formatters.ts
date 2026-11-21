const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

const THREE_DECIMAL_CURRENCIES = new Set([
  "BHD",
  "IQD",
  "JOD",
  "KWD",
  "LYD",
  "OMR",
  "TND",
]);

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateFormatCache = new Map<string, Intl.DateTimeFormat>();

export function getCurrencyFractionDigits(currency?: string | null): number {
  const code = (currency || "").trim().toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(code)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(code)) return 3;
  return 2;
}

export function getCachedNumberFormat(
  locale: string | undefined,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale ?? "default"}|${options.style ?? ""}|${options.currency ?? ""}|${options.minimumFractionDigits ?? ""}|${options.maximumFractionDigits ?? ""}`;
  let fmt = numberFormatCache.get(key);
  if (!fmt) {
    if (numberFormatCache.size >= 64) {
      const oldest = numberFormatCache.keys().next().value;
      if (oldest !== undefined) numberFormatCache.delete(oldest);
    }
    fmt = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, fmt);
  }
  return fmt;
}

export function getCachedDateFormat(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale ?? "default"}|${JSON.stringify(options)}`;
  let fmt = dateFormatCache.get(key);
  if (!fmt) {
    if (dateFormatCache.size >= 64) {
      const oldest = dateFormatCache.keys().next().value;
      if (oldest !== undefined) dateFormatCache.delete(oldest);
    }
    fmt = new Intl.DateTimeFormat(locale, options);
    dateFormatCache.set(key, fmt);
  }
  return fmt;
}

export function formatMoneyMinorUnits(
  amountMinor: unknown,
  currency?: unknown,
  locale: string = "en-US",
): string {
  if (amountMinor === undefined || amountMinor === null) return "";
  const num = typeof amountMinor === "number" ? amountMinor : Number(amountMinor);
  const cur = currency ? String(currency).trim().toUpperCase() : "";
  if (!Number.isFinite(num)) return `${String(amountMinor)} ${cur}`.trim();

  const digits = getCurrencyFractionDigits(cur);
  const divisor = 10 ** digits;
  const major = num / divisor;
  const formatted = getCachedNumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(major);

  return cur ? `${formatted} ${cur}` : formatted;
}
