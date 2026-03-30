export function classifyWriteAmplification(ratio: number): string {
  if (ratio < 1) {
    return "invalid";
  }

  if (ratio <= 2) {
    return "excellent";
  }

  if (ratio <= 5) {
    return "good";
  }

  if (ratio <= 10) {
    return "needs_tuning";
  }

  return "poor";
}
