import type { NormalizedLandmark } from "@/src/types/garment";

const VISION_BUNDLE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";
const VISION_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const POSE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

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
  private readonly smoothing = 0.42;

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
    if (!landmarks) return null;

    if (!this.smoothed) {
      this.smoothed = landmarks.map((point) => ({ ...point }));
      return this.smoothed;
    }

    this.smoothed = landmarks.map((point, index) => {
      const previous = this.smoothed?.[index] ?? point;
      return {
        x: previous.x + (point.x - previous.x) * this.smoothing,
        y: previous.y + (point.y - previous.y) * this.smoothing,
        z: previous.z + (point.z - previous.z) * this.smoothing,
        visibility:
          previous.visibility +
          ((point.visibility ?? 0) - previous.visibility) * this.smoothing,
      };
    });

    return this.smoothed;
  }

  close(): void {
    this.landmarker?.close();
    this.landmarker = null;
    this.smoothed = null;
  }
}
