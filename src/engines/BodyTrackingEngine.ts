import type { NormalizedLandmark } from "@/src/types/garment";

const VISION_BUNDLE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";
const VISION_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";

type PoseResult = { landmarks?: Array<Array<NormalizedLandmark>> };

type PoseLandmarkerLike = {
  detectForVideo(video: HTMLVideoElement, timestamp: number): PoseResult;
  close(): void;
};

type VisionModule = {
  FilesetResolver: {
    forVisionTasks(path: string): Promise<unknown>;
  };
  PoseLandmarker: {
    createFromOptions(
      fileset: unknown,
      options: Record<string, unknown>,
    ): Promise<PoseLandmarkerLike>;
  };
};

export class BodyTrackingEngine {
  private landmarker: PoseLandmarkerLike | null = null;
  private smoothed: NormalizedLandmark[] | null = null;
  private missingFrames = 0;

  async initialize(): Promise<void> {
    if (this.landmarker) return;

    const vision = (await import(
      /* @vite-ignore */ VISION_BUNDLE_URL
    )) as VisionModule;
    const fileset = await vision.FilesetResolver.forVisionTasks(VISION_WASM_URL);

    try {
      this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.55,
        minPosePresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
        outputSegmentationMasks: false,
      });
    } catch {
      this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: "CPU" },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputSegmentationMasks: false,
      });
    }
  }

  detect(video: HTMLVideoElement, timestamp: number): NormalizedLandmark[] | null {
    if (!this.landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null;
    }

    const landmarks = this.landmarker.detectForVideo(video, timestamp).landmarks?.[0];
    if (!landmarks) {
      this.missingFrames += 1;
      if (this.missingFrames > 4) this.smoothed = null;
      return this.smoothed;
    }

    this.missingFrames = 0;

    if (!this.smoothed) {
      this.smoothed = landmarks.map((point) => ({ ...point }));
      return this.smoothed;
    }

    this.smoothed = landmarks.map((point, index) => {
      const previous = this.smoothed?.[index] ?? point;
      const visibility = point.visibility ?? 0;
      const movement = Math.hypot(point.x - previous.x, point.y - previous.y);
      const response = visibility > 0.78
        ? Math.min(0.64, Math.max(0.2, 0.2 + movement * 7.5))
        : visibility > 0.48
          ? 0.16
          : 0.08;
      const clampDelta = (next: number, before: number) => {
        const delta = Math.max(-0.09, Math.min(0.09, next - before));
        return before + delta * response;
      };
      return {
        x: clampDelta(point.x, previous.x),
        y: clampDelta(point.y, previous.y),
        z: clampDelta(point.z, previous.z),
        visibility:
          previous.visibility +
          (visibility - previous.visibility) * 0.32,
      };
    });

    return this.smoothed;
  }

  close(): void {
    this.landmarker?.close();
    this.landmarker = null;
    this.smoothed = null;
    this.missingFrames = 0;
  }
}
