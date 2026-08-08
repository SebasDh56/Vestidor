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

const KILLA_COLORS = ["#c84f34", "#e58b34", "#247b7b", "#d8b23a", "#17394c"];

type Point = { x: number; y: number };

export class VirtualTryOnEngine {
  prepareGarment(_garment: Garment): Promise<void> {
    return Promise.resolve();
  }

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
    const shoulderMid = this.midpoint(shoulderLeft, shoulderRight);
    const hipMid = this.midpoint(hipLeft, hipRight);
    const shoulderSpan = Math.max(90, Math.hypot(
      shoulderRight.x - shoulderLeft.x,
      shoulderRight.y - shoulderLeft.y,
    ));
    const torsoHeight = Math.max(150, Math.hypot(
      hipMid.x - shoulderMid.x,
      hipMid.y - shoulderMid.y,
    ));
    const scale = SIZE_SCALE[size];

    context.save();
    context.globalAlpha = 0.84;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = "rgba(27, 20, 16, .14)";
    context.shadowBlur = Math.max(3, shoulderSpan * 0.025);
    context.shadowOffsetY = Math.max(2, shoulderSpan * 0.012);

    this.drawSoftSleeve(
      context,
      shoulderLeft,
      elbowLeft,
      wristLeft,
      garment.overlayColor,
      shoulderSpan * 0.25 * scale.width,
      scale.sleeve,
      garment.slug === "chaqueta-killa-marfil",
    );
    this.drawSoftSleeve(
      context,
      shoulderRight,
      elbowRight,
      wristRight,
      garment.overlayColor,
      shoulderSpan * 0.25 * scale.width,
      scale.sleeve,
      garment.slug === "chaqueta-killa-marfil",
    );

    if (garment.slug === "chaqueta-killa-marfil") {
      this.drawOpenKilla(
        context,
        shoulderLeft,
        shoulderRight,
        hipLeft,
        hipRight,
        shoulderMid,
        shoulderSpan,
        torsoHeight,
        scale,
        garment.overlayColor,
      );
    } else {
      this.drawSimpleBody(
        context,
        shoulderMid,
        shoulderSpan,
        torsoHeight,
        scale,
        garment.overlayColor,
        garment.overlayAccent,
      );
    }

    context.restore();
    if (debug) this.drawDebug(context, landmarks);
  }

  private drawOpenKilla(
    context: CanvasRenderingContext2D,
    shoulderLeft: Point,
    shoulderRight: Point,
    hipLeft: Point,
    hipRight: Point,
    shoulderMid: Point,
    shoulderSpan: number,
    torsoHeight: number,
    scale: { width: number; length: number; sleeve: number },
    color: string,
  ) {
    const fittedLeft = this.scaleFrom(shoulderMid, shoulderLeft, scale.width * 1.05);
    const fittedRight = this.scaleFrom(shoulderMid, shoulderRight, scale.width * 1.05);
    const hipMid = this.midpoint(hipLeft, hipRight);
    const fittedHipLeft = this.scaleFrom(hipMid, hipLeft, scale.width * 1.12);
    const fittedHipRight = this.scaleFrom(hipMid, hipRight, scale.width * 1.12);
    const topY = shoulderMid.y - shoulderSpan * 0.1;
    const hemY = shoulderMid.y + torsoHeight * 1.15 * scale.length;
    const tipY = hemY + torsoHeight * 0.12;
    const innerTopLeft = { x: shoulderMid.x - shoulderSpan * 0.12, y: topY + shoulderSpan * 0.03 };
    const innerTopRight = { x: shoulderMid.x + shoulderSpan * 0.12, y: topY + shoulderSpan * 0.03 };
    const innerChestLeft = { x: shoulderMid.x - shoulderSpan * 0.055, y: shoulderMid.y + torsoHeight * 0.32 };
    const innerChestRight = { x: shoulderMid.x + shoulderSpan * 0.055, y: shoulderMid.y + torsoHeight * 0.32 };
    const innerHemLeft = { x: shoulderMid.x - shoulderSpan * 0.018, y: tipY };
    const innerHemRight = { x: shoulderMid.x + shoulderSpan * 0.018, y: tipY };
    const outerHemLeft = this.scaleFrom(hipMid, fittedHipLeft, 1.08);
    const outerHemRight = this.scaleFrom(hipMid, fittedHipRight, 1.08);
    outerHemLeft.y = hemY;
    outerHemRight.y = hemY;

    const leftPanel = new Path2D();
    leftPanel.moveTo(fittedLeft.x, topY);
    leftPanel.quadraticCurveTo(fittedHipLeft.x - shoulderSpan * 0.08, shoulderMid.y + torsoHeight * 0.52, outerHemLeft.x, outerHemLeft.y);
    leftPanel.lineTo(innerHemLeft.x, innerHemLeft.y);
    leftPanel.quadraticCurveTo(innerChestLeft.x, innerChestLeft.y, innerTopLeft.x, innerTopLeft.y);
    leftPanel.quadraticCurveTo(shoulderMid.x - shoulderSpan * 0.31, topY - shoulderSpan * 0.025, fittedLeft.x, topY);
    leftPanel.closePath();

    const rightPanel = new Path2D();
    rightPanel.moveTo(fittedRight.x, topY);
    rightPanel.quadraticCurveTo(fittedHipRight.x + shoulderSpan * 0.08, shoulderMid.y + torsoHeight * 0.52, outerHemRight.x, outerHemRight.y);
    rightPanel.lineTo(innerHemRight.x, innerHemRight.y);
    rightPanel.quadraticCurveTo(innerChestRight.x, innerChestRight.y, innerTopRight.x, innerTopRight.y);
    rightPanel.quadraticCurveTo(shoulderMid.x + shoulderSpan * 0.31, topY - shoulderSpan * 0.025, fittedRight.x, topY);
    rightPanel.closePath();

    const fill = context.createLinearGradient(fittedLeft.x, 0, fittedRight.x, 0);
    fill.addColorStop(0, this.shade(color, -14));
    fill.addColorStop(0.26, this.shade(color, 8));
    fill.addColorStop(0.52, this.shade(color, 18));
    fill.addColorStop(0.78, this.shade(color, 5));
    fill.addColorStop(1, this.shade(color, -16));
    context.fillStyle = fill;
    context.fill(leftPanel);
    context.fill(rightPanel);

    context.shadowColor = "transparent";
    context.strokeStyle = "rgba(110, 88, 68, .28)";
    context.lineWidth = Math.max(1.2, shoulderSpan * 0.008);
    context.stroke(leftPanel);
    context.stroke(rightPanel);

    const bandDepth = Math.max(18, torsoHeight * 0.15);
    const leftBand = [
      { x: fittedLeft.x, y: topY }, innerTopLeft,
      { x: innerTopLeft.x - shoulderSpan * 0.02, y: innerTopLeft.y + bandDepth },
      { x: fittedLeft.x + shoulderSpan * 0.015, y: topY + bandDepth },
    ];
    const rightBand = [
      innerTopRight, { x: fittedRight.x, y: topY },
      { x: fittedRight.x - shoulderSpan * 0.015, y: topY + bandDepth },
      { x: innerTopRight.x + shoulderSpan * 0.02, y: innerTopRight.y + bandDepth },
    ];
    this.drawColorBlocks(context, leftBand);
    this.drawColorBlocks(context, rightBand);

    context.strokeStyle = "rgba(255,255,255,.5)";
    context.lineWidth = Math.max(1.5, shoulderSpan * 0.012);
    context.beginPath();
    context.moveTo(innerTopLeft.x, innerTopLeft.y);
    context.quadraticCurveTo(innerChestLeft.x, innerChestLeft.y, innerHemLeft.x, innerHemLeft.y);
    context.moveTo(innerTopRight.x, innerTopRight.y);
    context.quadraticCurveTo(innerChestRight.x, innerChestRight.y, innerHemRight.x, innerHemRight.y);
    context.stroke();

    context.strokeStyle = "rgba(93, 71, 54, .11)";
    context.lineWidth = Math.max(1, shoulderSpan * 0.006);
    for (const offset of [-0.25, 0.25]) {
      context.beginPath();
      context.moveTo(shoulderMid.x + shoulderSpan * offset, shoulderMid.y + bandDepth);
      context.quadraticCurveTo(shoulderMid.x + shoulderSpan * offset * 0.82, shoulderMid.y + torsoHeight * 0.62, shoulderMid.x + shoulderSpan * offset * 0.72, hemY);
      context.stroke();
    }
  }

  private drawSoftSleeve(
    context: CanvasRenderingContext2D,
    shoulder: Point,
    elbow: Point,
    wrist: Point,
    color: string,
    width: number,
    sleeveScale: number,
    withColorCuff: boolean,
  ) {
    const end = this.scaleFrom(elbow, wrist, sleeveScale);
    const gradient = context.createLinearGradient(shoulder.x, shoulder.y, end.x, end.y);
    gradient.addColorStop(0, this.shade(color, 12));
    gradient.addColorStop(0.55, color);
    gradient.addColorStop(1, this.shade(color, -13));
    context.strokeStyle = gradient;
    context.lineWidth = Math.max(24, width);
    context.beginPath();
    context.moveTo(shoulder.x, shoulder.y);
    context.quadraticCurveTo(elbow.x, elbow.y, end.x, end.y);
    context.stroke();

    context.shadowColor = "transparent";
    context.strokeStyle = "rgba(255,255,255,.2)";
    context.lineWidth = Math.max(1.5, width * 0.045);
    context.beginPath();
    context.moveTo(shoulder.x, shoulder.y);
    context.quadraticCurveTo(elbow.x, elbow.y, end.x, end.y);
    context.stroke();

    if (withColorCuff) this.drawColorCuff(context, elbow, end, width * 0.9);
  }

  private drawColorCuff(
    context: CanvasRenderingContext2D,
    elbow: Point,
    wrist: Point,
    width: number,
  ) {
    const start = this.lerp(elbow, wrist, 0.78);
    const normal = this.segmentNormal(start, wrist);
    const half = width / 2;
    const points = [
      { x: start.x + normal.x * half, y: start.y + normal.y * half },
      { x: wrist.x + normal.x * half * 0.9, y: wrist.y + normal.y * half * 0.9 },
      { x: wrist.x - normal.x * half * 0.9, y: wrist.y - normal.y * half * 0.9 },
      { x: start.x - normal.x * half, y: start.y - normal.y * half },
    ];
    this.drawColorBlocks(context, points);
  }

  private drawColorBlocks(context: CanvasRenderingContext2D, points: Point[]) {
    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
    path.closePath();
    const bounds = points.reduce(
      (result, point) => ({
        minX: Math.min(result.minX, point.x),
        maxX: Math.max(result.maxX, point.x),
        minY: Math.min(result.minY, point.y),
        maxY: Math.max(result.maxY, point.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
    );
    const width = Math.max(1, bounds.maxX - bounds.minX);
    context.save();
    context.clip(path);
    KILLA_COLORS.forEach((color, index) => {
      context.fillStyle = color;
      context.fillRect(
        bounds.minX + (width * index) / KILLA_COLORS.length,
        bounds.minY - 2,
        width / KILLA_COLORS.length + 1,
        bounds.maxY - bounds.minY + 4,
      );
    });
    context.restore();
    context.strokeStyle = "rgba(255,255,255,.35)";
    context.lineWidth = 1;
    context.stroke(path);
  }

  private drawSimpleBody(
    context: CanvasRenderingContext2D,
    shoulderMid: Point,
    shoulderSpan: number,
    torsoHeight: number,
    scale: { width: number; length: number; sleeve: number },
    color: string,
    accent: string,
  ) {
    const halfWidth = shoulderSpan * 0.59 * scale.width;
    const hemY = shoulderMid.y + torsoHeight * 1.12 * scale.length;
    const topY = shoulderMid.y - shoulderSpan * 0.12;
    context.beginPath();
    context.moveTo(shoulderMid.x - halfWidth, topY);
    context.quadraticCurveTo(shoulderMid.x - halfWidth * 1.08, shoulderMid.y + torsoHeight * 0.45, shoulderMid.x - halfWidth * 0.82, hemY);
    context.lineTo(shoulderMid.x, hemY + torsoHeight * 0.06);
    context.lineTo(shoulderMid.x + halfWidth * 0.82, hemY);
    context.quadraticCurveTo(shoulderMid.x + halfWidth * 1.08, shoulderMid.y + torsoHeight * 0.45, shoulderMid.x + halfWidth, topY);
    context.quadraticCurveTo(shoulderMid.x, shoulderMid.y + shoulderSpan * 0.13, shoulderMid.x - halfWidth, topY);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = accent;
    context.lineWidth = Math.max(6, shoulderSpan * 0.05);
    context.stroke();
  }

  private shade(hex: string, amount: number): string {
    const normalized = hex.replace("#", "");
    if (normalized.length !== 6) return hex;
    const value = Number.parseInt(normalized, 16);
    const red = Math.max(0, Math.min(255, (value >> 16) + amount));
    const green = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
    const blue = Math.max(0, Math.min(255, (value & 255) + amount));
    return `rgb(${red}, ${green}, ${blue})`;
  }

  private midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  private lerp(a: Point, b: Point, amount: number): Point {
    return { x: a.x + (b.x - a.x) * amount, y: a.y + (b.y - a.y) * amount };
  }

  private scaleFrom(origin: Point, point: Point, factor: number): Point {
    return { x: origin.x + (point.x - origin.x) * factor, y: origin.y + (point.y - origin.y) * factor };
  }

  private segmentNormal(start: Point, end: Point): Point {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(0.001, Math.hypot(dx, dy));
    return { x: -dy / length, y: dx / length };
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
      const point = toPoint(index);
      context.beginPath();
      context.arc(point.x, point.y, 5, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }
}
