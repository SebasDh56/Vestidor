import type {
  Garment,
  GarmentSize,
  NormalizedLandmark,
} from "@/src/types/garment";

const SIZE_SCALE: Record<GarmentSize, { width: number; length: number; sleeve: number }> = {
  S: { width: 0.92, length: 0.94, sleeve: 0.95 },
  M: { width: 1, length: 1, sleeve: 1 },
  L: { width: 1.09, length: 1.05, sleeve: 1.04 },
  XL: { width: 1.17, length: 1.1, sleeve: 1.08 },
};

const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
];

type Point = { x: number; y: number };

export class VirtualTryOnEngine {
  render(
    context: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    garment: Garment,
    size: GarmentSize,
    debug = false,
  ): void {
    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (landmarks.length < 25) return;

    const point = (index: number): Point => ({
      x: (1 - landmarks[index].x) * canvas.width,
      y: landmarks[index].y * canvas.height,
    });
    const shoulderLeft = point(12);
    const shoulderRight = point(11);
    const hipLeft = point(24);
    const hipRight = point(23);
    const elbowLeft = point(14);
    const elbowRight = point(13);
    const wristLeft = point(16);
    const wristRight = point(15);
    const scale = SIZE_SCALE[size];

    const shoulderMid = {
      x: (shoulderLeft.x + shoulderRight.x) / 2,
      y: (shoulderLeft.y + shoulderRight.y) / 2,
    };
    const shoulderSpan = Math.max(90, Math.abs(shoulderRight.x - shoulderLeft.x));
    const torsoHeight = Math.max(
      150,
      Math.abs((hipLeft.y + hipRight.y) / 2 - shoulderMid.y),
    );
    const halfWidth = shoulderSpan * 0.59 * scale.width;
    const hemY = shoulderMid.y + torsoHeight * 1.12 * scale.length;
    const centerX = shoulderMid.x;

    context.save();
    context.globalAlpha = 0.87;
    context.lineCap = "round";
    context.lineJoin = "round";

    this.drawSleeve(
      context,
      shoulderLeft,
      elbowLeft,
      wristLeft,
      garment.overlayColor,
      garment.overlayAccent,
      shoulderSpan * 0.24 * scale.width,
      scale.sleeve,
    );
    this.drawSleeve(
      context,
      shoulderRight,
      elbowRight,
      wristRight,
      garment.overlayColor,
      garment.overlayAccent,
      shoulderSpan * 0.24 * scale.width,
      scale.sleeve,
    );

    const topY = shoulderMid.y - shoulderSpan * 0.12;
    context.beginPath();
    context.moveTo(centerX - halfWidth, topY);
    context.quadraticCurveTo(
      centerX - halfWidth * 1.08,
      shoulderMid.y + torsoHeight * 0.45,
      centerX - halfWidth * 0.82,
      hemY,
    );
    context.lineTo(centerX, hemY + torsoHeight * 0.06);
    context.lineTo(centerX + halfWidth * 0.82, hemY);
    context.quadraticCurveTo(
      centerX + halfWidth * 1.08,
      shoulderMid.y + torsoHeight * 0.45,
      centerX + halfWidth,
      topY,
    );
    context.quadraticCurveTo(centerX, shoulderMid.y + shoulderSpan * 0.13, centerX - halfWidth, topY);
    context.closePath();
    context.fillStyle = garment.overlayColor;
    context.fill();

    context.globalAlpha = 0.98;
    context.strokeStyle = garment.overlayAccent;
    context.lineWidth = Math.max(8, shoulderSpan * 0.075);
    context.beginPath();
    context.moveTo(centerX - halfWidth * 0.82, topY + shoulderSpan * 0.04);
    context.lineTo(centerX - halfWidth * 0.24, shoulderMid.y + shoulderSpan * 0.03);
    context.moveTo(centerX + halfWidth * 0.82, topY + shoulderSpan * 0.04);
    context.lineTo(centerX + halfWidth * 0.24, shoulderMid.y + shoulderSpan * 0.03);
    context.stroke();

    context.strokeStyle = "rgba(255,255,255,.55)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(centerX, shoulderMid.y + shoulderSpan * 0.08);
    context.lineTo(centerX, hemY);
    context.stroke();

    context.restore();

    if (debug) this.drawDebug(context, landmarks);
  }

  private drawSleeve(
    context: CanvasRenderingContext2D,
    shoulder: Point,
    elbow: Point,
    wrist: Point,
    color: string,
    accent: string,
    width: number,
    sleeveScale: number,
  ) {
    const end = {
      x: elbow.x + (wrist.x - elbow.x) * sleeveScale,
      y: elbow.y + (wrist.y - elbow.y) * sleeveScale,
    };
    context.strokeStyle = color;
    context.lineWidth = Math.max(24, width);
    context.beginPath();
    context.moveTo(shoulder.x, shoulder.y);
    context.quadraticCurveTo(elbow.x, elbow.y, end.x, end.y);
    context.stroke();

    context.strokeStyle = accent;
    context.lineWidth = Math.max(10, width * 0.55);
    context.beginPath();
    context.moveTo(
      end.x + (elbow.x - end.x) * 0.08,
      end.y + (elbow.y - end.y) * 0.08,
    );
    context.lineTo(end.x, end.y);
    context.stroke();
  }

  private drawDebug(
    context: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
  ) {
    const toPoint = (index: number) => ({
      x: (1 - landmarks[index].x) * context.canvas.width,
      y: landmarks[index].y * context.canvas.height,
    });

    context.save();
    context.strokeStyle = "rgba(94, 230, 194, .86)";
    context.fillStyle = "#f7fffb";
    context.lineWidth = 3;
    for (const [a, b] of CONNECTIONS) {
      const from = toPoint(a);
      const to = toPoint(b);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }
    for (const index of [11, 12, 13, 14, 15, 16, 23, 24]) {
      const p = toPoint(index);
      context.beginPath();
      context.arc(p.x, p.y, 5, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }
}
