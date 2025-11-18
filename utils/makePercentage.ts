/**
 * Calculates percentage value from a given numerator and denominator
 * @param {number} value - The numerator value
 * @param {number} total - The denominator value (total)
 * @returns {number} Percentage value (0-100)
 * @example
 * makePercentage(25, 100) // Returns 25
 * makePercentage(1, 4)    // Returns 25
 */
export default function makePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}
