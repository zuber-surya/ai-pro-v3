/** Client-side EMI for affordability sliders (mirrors backend formula). */
export function computeEmi(
  principal: number,
  annualRatePct: number,
  tenureYears: number,
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  const n = tenureYears * 12;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / n;
  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

export function formatInr(n: number): string {
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `₹${Math.round(n)}`;
  }
}
