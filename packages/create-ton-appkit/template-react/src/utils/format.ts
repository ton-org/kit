/** Format a decimal token amount for display. */
export function formatAmount(value: string): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return value;
    return n.toLocaleString('en-US', {
        maximumFractionDigits: 4,
        maximumSignificantDigits: 4,
        roundingPriority: 'morePrecision',
    });
}
