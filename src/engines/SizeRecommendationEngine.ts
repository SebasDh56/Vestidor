import type {
  BodyMeasurements,
  Garment,
  GarmentSize,
  NormalizedLandmark,
  SizeRecommendation,
} from "@/src/types/garment";
import { selectClosestSize } from "./size-recommendation-core.mjs";

const distance = (a: NormalizedLandmark, b: NormalizedLandmark) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export class SizeRecommendationEngine {
  estimateMeasurements(landmarks: NormalizedLandmark[]): BodyMeasurements | null {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

    const shoulderWidth = distance(leftShoulder, rightShoulder);
    const hipWidth = distance(leftHip, rightHip);
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const torsoHeight = Math.abs(hipMidY - shoulderMidY);
    const confidence =
      [leftShoulder, rightShoulder, leftHip, rightHip].reduce(
        (sum, point) => sum + (point.visibility ?? 0),
        0,
      ) / 4;

    return { shoulderWidth, torsoHeight, hipWidth, confidence };
  }

  recommend(
    landmarks: NormalizedLandmark[],
    heightCm: number,
    garment: Garment,
  ): SizeRecommendation | null {
    const measurements = this.estimateMeasurements(landmarks);
    if (!measurements || measurements.confidence < 0.45) return null;

    const projectedShoulderCm =
      Math.max(34, Math.min(48, measurements.shoulderWidth * heightCm * 0.58));
    const closest = selectClosestSize(garment.sizeChart, projectedShoulderCm);
    const recommendedSize = closest.size as GarmentSize;
    const gap = Math.abs(closest.shoulderWidth - projectedShoulderCm);
    const confidence = Math.max(
      0.58,
      Math.min(0.94, measurements.confidence * (1 - gap / 18)),
    );

    return {
      recommendedSize,
      confidence,
      fitDescription: gap < 1.8 ? "Ajuste regular" : "Ajuste aproximado",
    };
  }
}
