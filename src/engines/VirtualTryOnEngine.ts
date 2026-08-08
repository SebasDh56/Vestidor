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

type TextureLayers = {
  width: number;
  height: number;
  torso: HTMLCanvasElement;
  leftUpper: HTMLCanvasElement;
  leftLower: HTMLCanvasElement;
  rightUpper: HTMLCanvasElement;
  rightLower: HTMLCanvasElement;
};

export class VirtualTryOnEngine {
  private readonly textures = new Map<string, TextureLayers>();
  private readonly texturePromises = new Map<string, Promise<void>>();

  prepareGarment(garment: Garment): Promise<void> {
    const source = this.textureSource(garment);
    if (!source || this.textures.has(garment.slug)) return Promise.resolve();
    const pending = this.texturePromises.get(garment.slug);
    if (pending) return pending;

    const promise = new Promise<void>((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        this.textures.set(garment.slug, this.createTextureLayers(image));
        resolve();
      };
      image.onerror = () => resolve();
      image.src = source;
    });
    this.texturePromises.set(garment.slug, promise);
    return promise;
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

    const texture = this.textures.get(garment.slug);
    if (texture) {
      this.drawTexturedGarment(
        context,
        texture,
        shoulderLeft,
        shoulderRight,
        elbowLeft,
        elbowRight,
        wristLeft,
        wristRight,
        shoulderMid,
        shoulderSpan,
        torsoHeight,
        scale,
      );
      if (debug) this.drawDebug(context, landmarks);
      return;
    }

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

  private textureSource(garment: Garment): string | null {
    return garment.slug === "chaqueta-killa-marfil"
      ? "/images/products/chaqueta-killa-tryon.png"
      : null;
  }

  private drawTexturedGarment(
    context: CanvasRenderingContext2D,
    texture: TextureLayers,
    shoulderLeft: Point,
    shoulderRight: Point,
    elbowLeft: Point,
    elbowRight: Point,
    wristLeft: Point,
    wristRight: Point,
    shoulderMid: Point,
    shoulderSpan: number,
    torsoHeight: number,
    scale: { width: number; length: number; sleeve: number },
  ) {
    const fittedShoulderLeft = this.scaleFrom(shoulderMid, shoulderLeft, scale.width);
    const fittedShoulderRight = this.scaleFrom(shoulderMid, shoulderRight, scale.width);
    const fittedWristLeft = this.scaleFrom(elbowLeft, wristLeft, scale.sleeve);
    const fittedWristRight = this.scaleFrom(elbowRight, wristRight, scale.sleeve);

    const source = {
      leftShoulder: this.sourcePoint(texture, 0.255, 0.14),
      leftElbow: this.sourcePoint(texture, 0.19, 0.5),
      leftWrist: this.sourcePoint(texture, 0.12, 0.9),
      rightShoulder: this.sourcePoint(texture, 0.745, 0.14),
      rightElbow: this.sourcePoint(texture, 0.81, 0.5),
      rightWrist: this.sourcePoint(texture, 0.88, 0.9),
    };

    context.save();
    context.globalAlpha = 0.98;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.shadowColor = "rgba(42, 31, 24, .13)";
    context.shadowBlur = Math.max(3, shoulderSpan * 0.018);
    context.shadowOffsetY = Math.max(1, shoulderSpan * 0.008);

    this.drawTextureSegment(context, texture.leftLower, source.leftElbow, source.leftWrist, elbowLeft, fittedWristLeft);
    this.drawTextureSegment(context, texture.rightLower, source.rightElbow, source.rightWrist, elbowRight, fittedWristRight);
    this.drawTextureSegment(context, texture.leftUpper, source.leftShoulder, source.leftElbow, fittedShoulderLeft, elbowLeft);
    this.drawTextureSegment(context, texture.rightUpper, source.rightShoulder, source.rightElbow, fittedShoulderRight, elbowRight);

    const shoulderAngle = Math.atan2(
      fittedShoulderRight.y - fittedShoulderLeft.y,
      fittedShoulderRight.x - fittedShoulderLeft.x,
    );
    context.translate(shoulderMid.x, shoulderMid.y);
    context.rotate(shoulderAngle);
    const sourceShoulderSpan = texture.width * 0.49;
    const sourceTorsoHeight = texture.height * 0.76;
    const torsoScaleX = (shoulderSpan * scale.width * 1.08) / sourceShoulderSpan;
    const torsoScaleY = (torsoHeight * scale.length * 1.18) / sourceTorsoHeight;
    context.scale(torsoScaleX, torsoScaleY);
    context.drawImage(
      texture.torso,
      -texture.width * 0.5,
      -texture.height * 0.14,
    );
    context.restore();
  }

  private createTextureLayers(image: HTMLImageElement): TextureLayers {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const layer = (points: Array<[number, number]>) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return canvas;
      context.beginPath();
      points.forEach(([x, y], index) => {
        const px = x * width;
        const py = y * height;
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      });
      context.closePath();
      context.clip();
      context.drawImage(image, 0, 0);
      return canvas;
    };

    return {
      width,
      height,
      torso: layer([[0.22, 0.07], [0.78, 0.07], [0.76, 0.45], [0.73, 0.73], [0.52, 0.92], [0.48, 0.92], [0.27, 0.73], [0.24, 0.45]]),
      leftUpper: layer([[0.22, 0.1], [0.31, 0.16], [0.29, 0.51], [0.14, 0.59], [0.13, 0.29]]),
      leftLower: layer([[0.13, 0.48], [0.29, 0.47], [0.2, 0.94], [0.035, 0.94]]),
      rightUpper: layer([[0.78, 0.1], [0.69, 0.16], [0.71, 0.51], [0.86, 0.59], [0.87, 0.29]]),
      rightLower: layer([[0.87, 0.48], [0.71, 0.47], [0.8, 0.94], [0.965, 0.94]]),
    };
  }

  private drawTextureSegment(
    context: CanvasRenderingContext2D,
    layer: HTMLCanvasElement,
    sourceStart: Point,
    sourceEnd: Point,
    destinationStart: Point,
    destinationEnd: Point,
  ) {
    const sourceAngle = Math.atan2(sourceEnd.y - sourceStart.y, sourceEnd.x - sourceStart.x);
    const destinationAngle = Math.atan2(destinationEnd.y - destinationStart.y, destinationEnd.x - destinationStart.x);
    const sourceLength = Math.hypot(sourceEnd.x - sourceStart.x, sourceEnd.y - sourceStart.y);
    const destinationLength = Math.hypot(destinationEnd.x - destinationStart.x, destinationEnd.y - destinationStart.y);
    const segmentScale = destinationLength / Math.max(1, sourceLength);

    context.save();
    context.translate(destinationStart.x, destinationStart.y);
    context.rotate(destinationAngle - sourceAngle);
    context.scale(segmentScale, segmentScale);
    context.drawImage(layer, -sourceStart.x, -sourceStart.y);
    context.restore();
  }

  private sourcePoint(texture: TextureLayers, x: number, y: number): Point {
    return { x: texture.width * x, y: texture.height * y };
  }

  private scaleFrom(origin: Point, point: Point, factor: number): Point {
    return {
      x: origin.x + (point.x - origin.x) * factor,
      y: origin.y + (point.y - origin.y) * factor,
    };
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
