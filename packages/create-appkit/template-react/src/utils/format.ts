/**
 * Format a decimal token amount for display.
 *
 * Amounts >= 1 get 2–4 fraction digits; smaller amounts keep enough
 * digits to show the first significant one. Falls back to the raw
 * string when the value is not a finite number.
 */
export function formatAmount(value: string): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    if (n === 0) return '0';

    const abs = Math.abs(n);
    const maximumFractionDigits = abs >= 1 ? 4 : Math.max(2, -Math.floor(Math.log10(abs)) + 1);

    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits });
}
