/**
 * Converts a CSS hex color string (e.g., "#ff00aa" or "ff00aa") to a numeric 24-bit integer.
 * 
 * @param hex - The hex color string.
 * @returns The color represented as an integer.
 */
export function hexColorToNumber(hex: string): number {
  const cleanHex = hex.trim().replace(/^#/, "");
  
  if (cleanHex.length === 3) {
    const r = cleanHex[0] + cleanHex[0];
    const g = cleanHex[1] + cleanHex[1];
    const b = cleanHex[2] + cleanHex[2];
    return parseInt(r + g + b, 16);
  }
  
  const value = parseInt(cleanHex, 16);
  return isNaN(value) ? 0 : value & 0xffffff;
}

/**
 * Converts a numeric 24-bit integer to a CSS hex color string (e.g., "#ff00aa").
 * 
 * @param colorNumber - The color integer.
 * @returns The hex color string.
 */
export function numberToHexColor(colorNumber: number): string {
  const hex = (colorNumber & 0xffffff).toString(16).padStart(6, "0");
  return `#${hex}`;
}

/**
 * Calculates the dynamic accent-foreground color (either black "#000000" or white "#ffffff")
 * based on the YIQ contrast formula of the background hex color.
 * 
 * @param hexColor - The CSS hex color string.
 * @returns The foreground color ("#000000" or "#ffffff").
 */
export function getAccentForeground(hexColor: string): string {
  const cleanHex = hexColor.trim().replace(/^#/, "");
  
  let r = 0;
  let g = 0;
  let b = 0;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    const val = parseInt(cleanHex, 16);
    if (!isNaN(val)) {
      r = (val >> 16) & 0xff;
      g = (val >> 8) & 0xff;
      b = val & 0xff;
    }
  }

  // Calculate YIQ contrast ratio
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

/**
 * Converts a CSS hex color string to an OKLCH CSS string (e.g., "oklch(0.6 0.1 250)").
 *
 * @param hex - The CSS hex color string.
 * @returns The OKLCH color string.
 */
export function hexToOklch(hex: string): string {
  const cleanHex = hex.trim().replace(/^#/, "");
  
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    const val = parseInt(cleanHex, 16);
    if (!isNaN(val)) {
      r = (val >> 16) & 0xff;
      g = (val >> 8) & 0xff;
      b = val & 0xff;
    }
  }

  // sRGB to Linear sRGB
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // Linear sRGB to LMS
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // non-linear LMS
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // LMS to OKLab
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // OKLab to OKLCH
  const C = Math.hypot(a, b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

