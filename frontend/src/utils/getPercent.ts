/**
 * Calculates a percentage based on a value and a maximum.
 * Safely handles division by zero and caps the result at 100.
 */
export const getPercent = (value: number, max: number): number => {
  if (max === 0) return 0; // Prevent NaN (division by zero)
  const percent = Math.round((value / max) * 100);
  return Math.min(percent, 100); // Ensure it never exceeds 100%
};