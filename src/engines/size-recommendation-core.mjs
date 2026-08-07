export function selectClosestSize(sizeChart, projectedShoulderCm) {
  return sizeChart.reduce((best, candidate) =>
    Math.abs(candidate.shoulderWidth - projectedShoulderCm) <
    Math.abs(best.shoulderWidth - projectedShoulderCm)
      ? candidate
      : best,
  );
}
