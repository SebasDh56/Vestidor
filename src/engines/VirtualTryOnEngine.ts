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
    const handLeft = [point(18), point(20), point(22)];
    const handRight = [point(17), point(19), point(21)];
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

    if (garment.slug === "chaqueta-killa-marfil") {
      this.drawProceduralKilla(
        context,
        shoulderLeft,
        shoulderRight,
        hipLeft,
        hipRight,
        elbowLeft,
        elbowRight,
        wristLeft,
        wristRight,
        shoulderMid,
        shoulderSpan,
        torsoHeight,
        scale,
      );
      this.applyNaturalShading(context, shoulderMid, shoulderSpan, torsoHeight);
      this.revealHands(context, wristLeft, handLeft, shoulderSpan);
      this.revealHands(context, wristRight, handRight, shoulderSpan);
      if (debug) this.drawDebug(context, landmarks);
      return;
    }

    const texture = this.textures.get(garment.slug);
    if (texture) {
      this.drawTexturedGarment(
        context,
        texture,
        shoulderLeft,
        shoulderRight,
        hipLeft,
        hipRight,
        elbowLeft,
        elbowRight,
        wristLeft,
        wristRight,
        shoulderMid,
        shoulderSpan,
        torsoHeight,
        scale,
      );
      this.applyNaturalShading(context, shoulderMid, shoulderSpan, torsoHeight);
      this.revealHands(context, wristLeft, handLeft, shoulderSpan);
      this.revealHands(context, wristRight, handRight, shoulderSpan);
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
    return null;
  }

  private drawProceduralKilla(
    context: CanvasRenderingContext2D,
    shoulderLeft: Point,
    shoulderRight: Point,
    hipLeft: Point,
    hipRight: Point,
    elbowLeft: Point,
    elbowRight: Point,
    wristLeft: Point,
    wristRight: Point,
    shoulderMid: Point,
    shoulderSpan: number,
    torsoHeight: number,
    scale: { width: number; length: number; sleeve: number },
  ) {
    const fittedShoulderLeft = this.scaleFrom(shoulderMid, shoulderLeft, scale.width * 1.06);
    const fittedShoulderRight = this.scaleFrom(shoulderMid, shoulderRight, scale.width * 1.06);
    const fittedWristLeft = this.scaleFrom(elbowLeft, wristLeft, scale.sleeve);
    const fittedWristRight = this.scaleFrom(elbowRight, wristRight, scale.sleeve);
    const hipMid = this.midpoint(hipLeft, hipRight);
    const fittedHipLeft = this.scaleFrom(hipMid, hipLeft, scale.width * 1.12);
    const fittedHipRight = this.scaleFrom(hipMid, hipRight, scale.width * 1.12);
    const sleeveTopWidth = shoulderSpan * 0.29 * scale.width;
    const sleeveEndWidth = shoulderSpan * 0.18 * scale.width;

    context.save();
    context.globalAlpha = 0.96;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.shadowColor = "rgba(39, 27, 20, .18)";
    context.shadowBlur = Math.max(3, shoulderSpan * 0.025);
    context.shadowOffsetY = Math.max(2, shoulderSpan * 0.012);

    this.drawProceduralSleeve(context, fittedShoulderLeft, elbowLeft, fittedWristLeft, sleeveTopWidth, sleeveEndWidth);
    this.drawProceduralSleeve(context, fittedShoulderRight, elbowRight, fittedWristRight, sleeveTopWidth, sleeveEndWidth);

    const hemY = shoulderMid.y + torsoHeight * 1.18 * scale.length;
    this.drawKillaFrontPanels(
      context,
      fittedShoulderLeft,
      fittedShoulderRight,
      fittedHipLeft,
      fittedHipRight,
      shoulderMid,
      shoulderSpan,
      torsoHeight,
      hemY,
    );
    context.restore();
  }

  private drawProceduralSleeve(
    context: CanvasRenderingContext2D,
    shoulder: Point,
    elbow: Point,
    wrist: Point,
    topWidth: number,
    endWidth: number,
  ) {
    const upperNormal = this.segmentNormal(shoulder, elbow);
    const lowerNormal = this.segmentNormal(elbow, wrist);
    const jointNormal = this.normalized({ x: upperNormal.x + lowerNormal.x, y: upperNormal.y + lowerNormal.y });
    const topHalf = topWidth / 2;
    const elbowHalf = topWidth * 0.43;
    const wristHalf = endWidth / 2;
    const sleeve = new Path2D();
    sleeve.moveTo(shoulder.x + upperNormal.x * topHalf, shoulder.y + upperNormal.y * topHalf);
    sleeve.quadraticCurveTo(elbow.x + jointNormal.x * elbowHalf, elbow.y + jointNormal.y * elbowHalf, wrist.x + lowerNormal.x * wristHalf, wrist.y + lowerNormal.y * wristHalf);
    sleeve.lineTo(wrist.x - lowerNormal.x * wristHalf, wrist.y - lowerNormal.y * wristHalf);
    sleeve.quadraticCurveTo(elbow.x - jointNormal.x * elbowHalf, elbow.y - jointNormal.y * elbowHalf, shoulder.x - upperNormal.x * topHalf, shoulder.y - upperNormal.y * topHalf);
    sleeve.closePath();

    const base = context.createLinearGradient(shoulder.x, shoulder.y, wrist.x, wrist.y);
    base.addColorStop(0, "#eadfce");
    base.addColorStop(0.42, "#dfcfb9");
    base.addColorStop(0.72, "#efe3d2");
    base.addColorStop(1, "#c9b59d");
    context.fillStyle = base;
    context.fill(sleeve);

    context.strokeStyle = "rgba(105, 82, 61, .28)";
    context.lineWidth = Math.max(1.2, topWidth * 0.018);
    context.stroke(sleeve);
    context.strokeStyle = "rgba(255,255,255,.25)";
    context.lineWidth = Math.max(1, topWidth * 0.012);
    context.beginPath();
    context.moveTo(shoulder.x, shoulder.y);
    context.quadraticCurveTo(elbow.x, elbow.y, wrist.x, wrist.y);
    context.stroke();

    const cuffStart = this.lerp(elbow, wrist, 0.72);
    const cuffHalfStart = wristHalf * 1.12;
    const cuff = new Path2D();
    cuff.moveTo(cuffStart.x + lowerNormal.x * cuffHalfStart, cuffStart.y + lowerNormal.y * cuffHalfStart);
    cuff.lineTo(wrist.x + lowerNormal.x * wristHalf, wrist.y + lowerNormal.y * wristHalf);
    cuff.lineTo(wrist.x - lowerNormal.x * wristHalf, wrist.y - lowerNormal.y * wristHalf);
    cuff.lineTo(cuffStart.x - lowerNormal.x * cuffHalfStart, cuffStart.y - lowerNormal.y * cuffHalfStart);
    cuff.closePath();
    this.fillAndeanPattern(context, cuff, cuffStart, wrist);
    context.strokeStyle = "rgba(20, 35, 46, .48)";
    context.lineWidth = Math.max(1.2, endWidth * 0.025);
    context.stroke(cuff);
  }

  private drawKillaFrontPanels(
    context: CanvasRenderingContext2D,
    shoulderLeft: Point,
    shoulderRight: Point,
    hipLeft: Point,
    hipRight: Point,
    shoulderMid: Point,
    shoulderSpan: number,
    torsoHeight: number,
    hemY: number,
  ) {
    const innerTopLeft = { x: shoulderMid.x - shoulderSpan * 0.13, y: shoulderMid.y - shoulderSpan * 0.035 };
    const innerTopRight = { x: shoulderMid.x + shoulderSpan * 0.13, y: shoulderMid.y - shoulderSpan * 0.035 };
    const innerChestLeft = { x: shoulderMid.x - shoulderSpan * 0.055, y: shoulderMid.y + torsoHeight * 0.32 };
    const innerChestRight = { x: shoulderMid.x + shoulderSpan * 0.055, y: shoulderMid.y + torsoHeight * 0.32 };
    const innerHemLeft = { x: shoulderMid.x - shoulderSpan * 0.025, y: hemY + torsoHeight * 0.18 };
    const innerHemRight = { x: shoulderMid.x + shoulderSpan * 0.025, y: hemY + torsoHeight * 0.18 };
    const sideLeft = this.lerp(shoulderLeft, hipLeft, 0.58);
    const sideRight = this.lerp(shoulderRight, hipRight, 0.58);
    const outerHemLeft = this.scaleFrom(this.midpoint(hipLeft, hipRight), hipLeft, 1.1);
    const outerHemRight = this.scaleFrom(this.midpoint(hipLeft, hipRight), hipRight, 1.1);
    outerHemLeft.y = hemY;
    outerHemRight.y = hemY;

    const leftPanel = new Path2D();
    leftPanel.moveTo(shoulderLeft.x, shoulderLeft.y - shoulderSpan * 0.055);
    leftPanel.quadraticCurveTo(sideLeft.x - shoulderSpan * 0.07, sideLeft.y, outerHemLeft.x, outerHemLeft.y);
    leftPanel.lineTo(innerHemLeft.x, innerHemLeft.y);
    leftPanel.quadraticCurveTo(innerChestLeft.x, innerChestLeft.y, innerTopLeft.x, innerTopLeft.y);
    leftPanel.quadraticCurveTo(shoulderMid.x - shoulderSpan * 0.3, shoulderMid.y - shoulderSpan * 0.09, shoulderLeft.x, shoulderLeft.y - shoulderSpan * 0.055);
    leftPanel.closePath();

    const rightPanel = new Path2D();
    rightPanel.moveTo(shoulderRight.x, shoulderRight.y - shoulderSpan * 0.055);
    rightPanel.quadraticCurveTo(sideRight.x + shoulderSpan * 0.07, sideRight.y, outerHemRight.x, outerHemRight.y);
    rightPanel.lineTo(innerHemRight.x, innerHemRight.y);
    rightPanel.quadraticCurveTo(innerChestRight.x, innerChestRight.y, innerTopRight.x, innerTopRight.y);
    rightPanel.quadraticCurveTo(shoulderMid.x + shoulderSpan * 0.3, shoulderMid.y - shoulderSpan * 0.09, shoulderRight.x, shoulderRight.y - shoulderSpan * 0.055);
    rightPanel.closePath();

    const panelGradient = context.createLinearGradient(shoulderLeft.x, 0, shoulderRight.x, 0);
    panelGradient.addColorStop(0, "#cdbba4");
    panelGradient.addColorStop(0.22, "#eadfce");
    panelGradient.addColorStop(0.52, "#f0e5d5");
    panelGradient.addColorStop(0.8, "#ddccb6");
    panelGradient.addColorStop(1, "#c3ae95");
    context.fillStyle = panelGradient;
    context.fill(leftPanel);
    context.fill(rightPanel);

    context.strokeStyle = "rgba(111, 87, 65, .35)";
    context.lineWidth = Math.max(1.2, shoulderSpan * 0.009);
    context.stroke(leftPanel);
    context.stroke(rightPanel);

    const panelDepth = torsoHeight * 0.17;
    const leftShoulderPanel = new Path2D();
    leftShoulderPanel.moveTo(shoulderLeft.x, shoulderLeft.y - shoulderSpan * 0.055);
    leftShoulderPanel.lineTo(innerTopLeft.x, innerTopLeft.y);
    leftShoulderPanel.lineTo(innerChestLeft.x - shoulderSpan * 0.04, innerTopLeft.y + panelDepth);
    leftShoulderPanel.lineTo(shoulderLeft.x + shoulderSpan * 0.02, shoulderLeft.y + panelDepth);
    leftShoulderPanel.closePath();
    const rightShoulderPanel = new Path2D();
    rightShoulderPanel.moveTo(innerTopRight.x, innerTopRight.y);
    rightShoulderPanel.lineTo(shoulderRight.x, shoulderRight.y - shoulderSpan * 0.055);
    rightShoulderPanel.lineTo(shoulderRight.x - shoulderSpan * 0.02, shoulderRight.y + panelDepth);
    rightShoulderPanel.lineTo(innerChestRight.x + shoulderSpan * 0.04, innerTopRight.y + panelDepth);
    rightShoulderPanel.closePath();
    this.fillAndeanPattern(context, leftShoulderPanel, shoulderLeft, innerChestLeft);
    this.fillAndeanPattern(context, rightShoulderPanel, innerTopRight, shoulderRight);

    context.strokeStyle = "rgba(255,255,255,.62)";
    context.lineWidth = Math.max(1.5, shoulderSpan * 0.012);
    context.beginPath();
    context.moveTo(innerTopLeft.x, innerTopLeft.y);
    context.quadraticCurveTo(innerChestLeft.x, innerChestLeft.y, innerHemLeft.x, innerHemLeft.y);
    context.moveTo(innerTopRight.x, innerTopRight.y);
    context.quadraticCurveTo(innerChestRight.x, innerChestRight.y, innerHemRight.x, innerHemRight.y);
    context.stroke();

    context.strokeStyle = "rgba(126, 101, 78, .16)";
    context.lineWidth = Math.max(1, shoulderSpan * 0.006);
    for (const offset of [-0.28, -0.18, 0.18, 0.28]) {
      context.beginPath();
      context.moveTo(shoulderMid.x + shoulderSpan * offset, shoulderMid.y + panelDepth);
      context.quadraticCurveTo(shoulderMid.x + shoulderSpan * offset * 0.8, shoulderMid.y + torsoHeight * 0.58, shoulderMid.x + shoulderSpan * offset * 0.72, hemY * 0.96 + shoulderMid.y * 0.04);
      context.stroke();
    }
  }

  private fillAndeanPattern(
    context: CanvasRenderingContext2D,
    path: Path2D,
    start: Point,
    end: Point,
  ) {
    context.save();
    context.clip(path);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const length = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
    const colors = ["#c74b32", "#ed8b35", "#19777a", "#dfb73d", "#19374b", "#d95e3d"];
    context.translate(start.x, start.y);
    context.rotate(angle);
    const stripeWidth = Math.max(7, length / colors.length);
    for (let index = -3; index < colors.length + 5; index += 1) {
      context.fillStyle = colors[((index % colors.length) + colors.length) % colors.length];
      context.fillRect(index * stripeWidth, -context.canvas.height, stripeWidth + 1, context.canvas.height * 2);
    }
    context.strokeStyle = "rgba(255,255,255,.58)";
    context.lineWidth = Math.max(1, stripeWidth * 0.08);
    for (let index = -3; index < colors.length + 5; index += 1) {
      context.beginPath();
      context.moveTo(index * stripeWidth, -context.canvas.height);
      context.lineTo(index * stripeWidth, context.canvas.height);
      context.stroke();
    }
    context.restore();
  }

  private segmentNormal(start: Point, end: Point): Point {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(0.001, Math.hypot(dx, dy));
    return { x: -dy / length, y: dx / length };
  }

  private normalized(point: Point): Point {
    const length = Math.max(0.001, Math.hypot(point.x, point.y));
    return { x: point.x / length, y: point.y / length };
  }

  private drawTexturedGarment(
    context: CanvasRenderingContext2D,
    texture: TextureLayers,
    shoulderLeft: Point,
    shoulderRight: Point,
    hipLeft: Point,
    hipRight: Point,
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

    const hipMid = this.midpoint(hipLeft, hipRight);
    const fittedHipLeft = this.scaleFrom(hipMid, hipLeft, scale.width * 1.04);
    const fittedHipRight = this.scaleFrom(hipMid, hipRight, scale.width * 1.04);
    this.drawWarpedTorso(
      context,
      texture,
      fittedShoulderLeft,
      fittedShoulderRight,
      fittedHipLeft,
      fittedHipRight,
      shoulderMid,
      torsoHeight,
      scale.length,
    );
    context.restore();
  }

  private drawWarpedTorso(
    context: CanvasRenderingContext2D,
    texture: TextureLayers,
    shoulderLeft: Point,
    shoulderRight: Point,
    hipLeft: Point,
    hipRight: Point,
    shoulderMid: Point,
    torsoHeight: number,
    lengthScale: number,
  ) {
    const sourceRows = [
      [this.sourcePoint(texture, 0.255, 0.14), this.sourcePoint(texture, 0.5, 0.14), this.sourcePoint(texture, 0.745, 0.14)],
      [this.sourcePoint(texture, 0.245, 0.46), this.sourcePoint(texture, 0.5, 0.46), this.sourcePoint(texture, 0.755, 0.46)],
      [this.sourcePoint(texture, 0.27, 0.73), this.sourcePoint(texture, 0.5, 0.92), this.sourcePoint(texture, 0.73, 0.73)],
    ];

    const middleLeft = this.lerp(shoulderLeft, hipLeft, 0.55);
    const middleRight = this.lerp(shoulderRight, hipRight, 0.55);
    const middleCenter = this.midpoint(middleLeft, middleRight);
    const hemY = shoulderMid.y + torsoHeight * 1.18 * lengthScale;
    const hipMid = this.midpoint(hipLeft, hipRight);
    const hemLeft = this.scaleFrom(hipMid, hipLeft, 1.12);
    const hemRight = this.scaleFrom(hipMid, hipRight, 1.12);
    const destinationRows = [
      [shoulderLeft, shoulderMid, shoulderRight],
      [middleLeft, middleCenter, middleRight],
      [
        { x: hemLeft.x, y: hemY },
        { x: hipMid.x, y: hemY + torsoHeight * 0.17 * lengthScale },
        { x: hemRight.x, y: hemY },
      ],
    ];

    for (let row = 0; row < 2; row += 1) {
      for (let column = 0; column < 2; column += 1) {
        const sourceTopLeft = sourceRows[row][column];
        const sourceTopRight = sourceRows[row][column + 1];
        const sourceBottomLeft = sourceRows[row + 1][column];
        const sourceBottomRight = sourceRows[row + 1][column + 1];
        const destinationTopLeft = destinationRows[row][column];
        const destinationTopRight = destinationRows[row][column + 1];
        const destinationBottomLeft = destinationRows[row + 1][column];
        const destinationBottomRight = destinationRows[row + 1][column + 1];

        this.drawTexturedTriangle(context, texture.torso, [sourceTopLeft, sourceTopRight, sourceBottomLeft], [destinationTopLeft, destinationTopRight, destinationBottomLeft]);
        this.drawTexturedTriangle(context, texture.torso, [sourceTopRight, sourceBottomRight, sourceBottomLeft], [destinationTopRight, destinationBottomRight, destinationBottomLeft]);
      }
    }
  }

  private drawTexturedTriangle(
    context: CanvasRenderingContext2D,
    image: CanvasImageSource,
    source: [Point, Point, Point],
    destination: [Point, Point, Point],
  ) {
    const [s0, s1, s2] = source;
    const [d0, d1, d2] = destination;
    const denominator = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y);
    if (Math.abs(denominator) < 0.001) return;

    const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denominator;
    const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denominator;
    const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / denominator;
    const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / denominator;
    const e = (d0.x * (s1.x * s2.y - s2.x * s1.y) + d1.x * (s2.x * s0.y - s0.x * s2.y) + d2.x * (s0.x * s1.y - s1.x * s0.y)) / denominator;
    const f = (d0.y * (s1.x * s2.y - s2.x * s1.y) + d1.y * (s2.x * s0.y - s0.x * s2.y) + d2.y * (s0.x * s1.y - s1.x * s0.y)) / denominator;

    context.save();
    context.beginPath();
    context.moveTo(d0.x, d0.y);
    context.lineTo(d1.x, d1.y);
    context.lineTo(d2.x, d2.y);
    context.closePath();
    context.clip();
    context.setTransform(a, b, c, d, e, f);
    context.drawImage(image, 0, 0);
    context.restore();
  }

  private applyNaturalShading(
    context: CanvasRenderingContext2D,
    shoulderMid: Point,
    shoulderSpan: number,
    torsoHeight: number,
  ) {
    context.save();
    context.globalCompositeOperation = "source-atop";
    const horizontal = context.createLinearGradient(
      shoulderMid.x - shoulderSpan,
      0,
      shoulderMid.x + shoulderSpan,
      0,
    );
    horizontal.addColorStop(0, "rgba(35, 24, 18, .16)");
    horizontal.addColorStop(0.28, "rgba(255, 255, 255, .05)");
    horizontal.addColorStop(0.52, "rgba(255, 255, 255, .11)");
    horizontal.addColorStop(0.78, "rgba(255, 255, 255, .03)");
    horizontal.addColorStop(1, "rgba(35, 24, 18, .17)");
    context.fillStyle = horizontal;
    context.fillRect(
      shoulderMid.x - shoulderSpan * 1.35,
      shoulderMid.y - shoulderSpan * 0.25,
      shoulderSpan * 2.7,
      torsoHeight * 1.7,
    );
    context.restore();
  }

  private revealHands(
    context: CanvasRenderingContext2D,
    wrist: Point,
    handPoints: Point[],
    shoulderSpan: number,
  ) {
    const hand = handPoints.reduce(
      (sum, point) => ({ x: sum.x + point.x / handPoints.length, y: sum.y + point.y / handPoints.length }),
      { x: 0, y: 0 },
    );
    const start = this.lerp(wrist, hand, 0.22);
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.lineCap = "round";
    context.lineWidth = Math.max(16, shoulderSpan * 0.095);
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(hand.x, hand.y);
    context.stroke();
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

  private midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  private lerp(a: Point, b: Point, amount: number): Point {
    return {
      x: a.x + (b.x - a.x) * amount,
      y: a.y + (b.y - a.y) * amount,
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
