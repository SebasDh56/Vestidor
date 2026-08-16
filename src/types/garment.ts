export const GARMENT_SIZES = ["S", "M", "L", "XL"] as const;

export type GarmentSize = (typeof GARMENT_SIZES)[number];
export type GarmentAvailability = "available" | "reserved" | "sold";

export type SizeChartEntry = {
  size: GarmentSize;
  chestMin: number;
  chestMax: number;
  shoulderWidth: number;
  garmentLength: number;
};

export type Garment = {
  id: number;
  slug: string;
  pieceCode: string;
  name: string;
  category: string;
  description: string;
  material: string;
  color: string;
  availability: GarmentAvailability;
  units: number;
  imageUrl: string;
  imageKey: string | null;
  imageFocus: "left" | "center" | "right";
  overlayColor: string;
  overlayAccent: string;
  featured: boolean;
  sizes: GarmentSize[];
  sizeChart: SizeChartEntry[];
};

export type NormalizedLandmark = {
  x: number;
  y: number;
  z: number;
  visibility: number;
};

export type BodyMeasurements = {
  shoulderWidth: number;
  torsoHeight: number;
  hipWidth: number;
  confidence: number;
};

export type SizeRecommendation = {
  recommendedSize: GarmentSize;
  confidence: number;
  fitDescription: string;
};
