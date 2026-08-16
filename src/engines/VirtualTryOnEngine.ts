import type { Garment, GarmentSize, NormalizedLandmark } from "@/src/types/garment";

const SIZE_SCALE: Record<GarmentSize, { width: number; length: number; sleeve: number }> = {
  S: { width: 0.93, length: 0.95, sleeve: 0.96 },
  M: { width: 1, length: 1, sleeve: 1 },
  L: { width: 1.08, length: 1.05, sleeve: 1.04 },
  XL: { width: 1.16, length: 1.1, sleeve: 1.08 },
};

const CONNECTIONS = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24]];
type Point = { x: number; y: number };

export class VirtualTryOnEngine {
  prepareGarment(_garment: Garment): Promise<void> { void _garment; return Promise.resolve(); }

  render(context: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], garment: Garment, size: GarmentSize, debug = false): void {
    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (landmarks.length < 25 || !this.visible(landmarks, [11, 12], 0.46)) {
      if (debug) this.drawDebug(context, landmarks);
      return;
    }

    const point = (index: number): Point => ({ x: (1 - landmarks[index].x) * canvas.width, y: landmarks[index].y * canvas.height });
    const leftShoulder = point(12);
    const rightShoulder = point(11);
    const shoulderVector = { x: rightShoulder.x - leftShoulder.x, y: rightShoulder.y - leftShoulder.y };
    const hasLeftHip = this.visible(landmarks, [24], 0.34);
    const hasRightHip = this.visible(landmarks, [23], 0.34);
    if (!hasLeftHip && !hasRightHip) {
      if (debug) this.drawDebug(context, landmarks);
      return;
    }
    const leftHip = hasLeftHip
      ? point(24)
      : { x: point(23).x - shoulderVector.x * 0.74, y: point(23).y - shoulderVector.y * 0.74 };
    const rightHip = hasRightHip
      ? point(23)
      : { x: point(24).x + shoulderVector.x * 0.74, y: point(24).y + shoulderVector.y * 0.74 };
    const shoulderMid = this.midpoint(leftShoulder, rightShoulder);
    const hipMid = this.midpoint(leftHip, rightHip);
    const shoulderSpan = Math.hypot(rightShoulder.x - leftShoulder.x, rightShoulder.y - leftShoulder.y);
    const torsoHeight = Math.hypot(hipMid.x - shoulderMid.x, hipMid.y - shoulderMid.y);
    if (shoulderSpan < canvas.width * 0.08 || torsoHeight < canvas.height * 0.1) return;

    const scale = SIZE_SCALE[size];
    const isLong = garment.slug.includes("larga") || garment.slug.includes("abrigo");
    const isAndean = garment.slug.includes("andina");
    const isEmbroidered = garment.slug.includes("bordad") || garment.slug.includes("abrigo");

    const resolveArm = (shoulderIndex: number, elbowIndex: number, wristIndex: number) => {
      if (!this.visible(landmarks, [shoulderIndex], 0.35)) return null;
      const shoulder = point(shoulderIndex);
      const hasElbow = this.visible(landmarks, [elbowIndex], 0.3);
      const hasWrist = this.visible(landmarks, [wristIndex], 0.3);
      if (!hasElbow && !hasWrist) return null;
      const wrist = hasWrist
        ? point(wristIndex)
        : this.scaleFrom(shoulder, point(elbowIndex), 1.92);
      const elbow = hasElbow
        ? point(elbowIndex)
        : this.lerp(shoulder, wrist, 0.52);
      return { shoulder, elbow, wrist };
    };

    const leftArm = resolveArm(12, 14, 16);
    const rightArm = resolveArm(11, 13, 15);

    context.save();
    context.globalAlpha = 0.82;
    context.globalCompositeOperation = "source-over";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = "rgba(18, 15, 20, .2)";
    context.shadowBlur = Math.max(3, shoulderSpan * 0.018);
    context.shadowOffsetY = Math.max(2, shoulderSpan * 0.01);

    if (leftArm) this.drawSleeve(context, leftArm.shoulder, leftArm.elbow, leftArm.wrist, shoulderSpan, scale, garment.overlayColor, garment.overlayAccent, isAndean, isEmbroidered);
    if (rightArm) this.drawSleeve(context, rightArm.shoulder, rightArm.elbow, rightArm.wrist, shoulderSpan, scale, garment.overlayColor, garment.overlayAccent, isAndean, isEmbroidered);

    this.drawBody(context, leftShoulder, rightShoulder, leftHip, rightHip, shoulderSpan, torsoHeight, scale, garment.overlayColor, garment.overlayAccent, isLong, isAndean, isEmbroidered);

    context.restore();
    if (debug) this.drawDebug(context, landmarks);
  }

  private drawBody(context: CanvasRenderingContext2D, leftShoulder: Point, rightShoulder: Point, leftHip: Point, rightHip: Point, shoulderSpan: number, torsoHeight: number, scale: { width: number; length: number; sleeve: number }, color: string, accent: string, isLong: boolean, isAndean: boolean, isEmbroidered: boolean) {
    const shoulderMid = this.midpoint(leftShoulder, rightShoulder);
    const hipMid = this.midpoint(leftHip, rightHip);
    const horizontal = this.unit(leftShoulder, rightShoulder);
    const vertical = this.unit(shoulderMid, hipMid);
    const at = (side: number, down: number): Point => ({
      x: shoulderMid.x + horizontal.x * side + vertical.x * down,
      y: shoulderMid.y + horizontal.y * side + vertical.y * down,
    });
    const length = (isLong ? 1.42 : 1.1) * scale.length;
    const hipHalf = Math.max(shoulderSpan * 0.43, Math.hypot(rightHip.x - leftHip.x, rightHip.y - leftHip.y) * 0.54) * scale.width;
    const topOffset = -shoulderSpan * 0.055;
    const outerLeft = at(-shoulderSpan * 0.53 * scale.width, topOffset);
    const outerRight = at(shoulderSpan * 0.53 * scale.width, topOffset);
    const hemDown = torsoHeight * length;
    const hemLeft = at(-hipHalf, hemDown);
    const hemRight = at(hipHalf, hemDown);
    const neckLeft = at(-shoulderSpan * 0.115, topOffset + shoulderSpan * 0.02);
    const neckRight = at(shoulderSpan * 0.115, topOffset + shoulderSpan * 0.02);
    const chestLeft = at(-shoulderSpan * 0.045, torsoHeight * 0.38);
    const chestRight = at(shoulderSpan * 0.045, torsoHeight * 0.38);
    const innerHemLeft = at(-shoulderSpan * 0.018, hemDown + torsoHeight * 0.05);
    const innerHemRight = at(shoulderSpan * 0.018, hemDown + torsoHeight * 0.05);
    const leftWaist = at(-hipHalf * 1.03, torsoHeight * 0.55);
    const rightWaist = at(hipHalf * 1.03, torsoHeight * 0.55);
    const leftHemControl = at(-hipHalf, hemDown - torsoHeight * 0.2);
    const rightHemControl = at(hipHalf, hemDown - torsoHeight * 0.2);
    const leftShoulderCurve = at(-shoulderSpan * 0.32, topOffset - shoulderSpan * 0.02);
    const rightShoulderCurve = at(shoulderSpan * 0.32, topOffset - shoulderSpan * 0.02);

    const leftPanel = new Path2D();
    leftPanel.moveTo(outerLeft.x, outerLeft.y);
    leftPanel.bezierCurveTo(leftWaist.x, leftWaist.y, leftHemControl.x, leftHemControl.y, hemLeft.x, hemLeft.y);
    leftPanel.lineTo(innerHemLeft.x, innerHemLeft.y);
    leftPanel.bezierCurveTo(chestLeft.x, chestLeft.y, neckLeft.x, neckLeft.y, neckLeft.x, neckLeft.y);
    leftPanel.quadraticCurveTo(leftShoulderCurve.x, leftShoulderCurve.y, outerLeft.x, outerLeft.y);
    leftPanel.closePath();

    const rightPanel = new Path2D();
    rightPanel.moveTo(outerRight.x, outerRight.y);
    rightPanel.bezierCurveTo(rightWaist.x, rightWaist.y, rightHemControl.x, rightHemControl.y, hemRight.x, hemRight.y);
    rightPanel.lineTo(innerHemRight.x, innerHemRight.y);
    rightPanel.bezierCurveTo(chestRight.x, chestRight.y, neckRight.x, neckRight.y, neckRight.x, neckRight.y);
    rightPanel.quadraticCurveTo(rightShoulderCurve.x, rightShoulderCurve.y, outerRight.x, outerRight.y);
    rightPanel.closePath();

    const fill = context.createLinearGradient(hemLeft.x, 0, hemRight.x, 0);
    fill.addColorStop(0, this.shade(color, -16));
    fill.addColorStop(0.28, this.shade(color, 8));
    fill.addColorStop(0.52, this.shade(color, 15));
    fill.addColorStop(0.76, this.shade(color, 6));
    fill.addColorStop(1, this.shade(color, -15));
    context.fillStyle = fill;
    context.fill(leftPanel);
    context.fill(rightPanel);
    context.shadowColor = "transparent";
    context.strokeStyle = "rgba(43, 38, 34, .24)";
    context.lineWidth = Math.max(1.2, shoulderSpan * 0.006);
    context.stroke(leftPanel);
    context.stroke(rightPanel);

    context.strokeStyle = "rgba(255,255,255,.48)";
    context.lineWidth = Math.max(1.2, shoulderSpan * 0.008);
    context.beginPath();
    context.moveTo(neckLeft.x, neckLeft.y);
    context.quadraticCurveTo(chestLeft.x, chestLeft.y, innerHemLeft.x, innerHemLeft.y);
    context.moveTo(neckRight.x, neckRight.y);
    context.quadraticCurveTo(chestRight.x, chestRight.y, innerHemRight.x, innerHemRight.y);
    context.stroke();

    context.strokeStyle = "rgba(32,24,30,.13)";
    context.lineWidth = Math.max(1, shoulderSpan * 0.004);
    context.beginPath();
    context.moveTo(leftWaist.x, leftWaist.y);
    context.quadraticCurveTo(at(-hipHalf * .82, torsoHeight * .72).x, at(-hipHalf * .82, torsoHeight * .72).y, hemLeft.x, hemLeft.y);
    context.moveTo(rightWaist.x, rightWaist.y);
    context.quadraticCurveTo(at(hipHalf * .82, torsoHeight * .72).x, at(hipHalf * .82, torsoHeight * .72).y, hemRight.x, hemRight.y);
    context.stroke();

    if (isAndean) {
      context.fillStyle = accent;
      const bandHeight = Math.max(10, shoulderSpan * 0.07);
      this.fillQuad(context, outerLeft, neckLeft, { x: neckLeft.x + vertical.x * bandHeight, y: neckLeft.y + vertical.y * bandHeight }, { x: outerLeft.x + vertical.x * bandHeight, y: outerLeft.y + vertical.y * bandHeight });
      this.fillQuad(context, neckRight, outerRight, { x: outerRight.x + vertical.x * bandHeight, y: outerRight.y + vertical.y * bandHeight }, { x: neckRight.x + vertical.x * bandHeight, y: neckRight.y + vertical.y * bandHeight });
    }

    if (isEmbroidered) {
      context.save();
      context.strokeStyle = accent;
      context.fillStyle = this.shade(accent, 18);
      context.lineWidth = Math.max(1.5, shoulderSpan * 0.008);
      for (const side of [-1, 1]) {
        const stemStart = at(side * shoulderSpan * 0.1, torsoHeight * 0.22);
        const stemEnd = at(side * shoulderSpan * 0.16, torsoHeight * 0.52);
        context.beginPath();
        context.moveTo(stemStart.x, stemStart.y);
        context.quadraticCurveTo(at(side * shoulderSpan * 0.23, torsoHeight * 0.35).x, at(side * shoulderSpan * 0.23, torsoHeight * 0.35).y, stemEnd.x, stemEnd.y);
        context.stroke();
        for (const down of [0.29, 0.4, 0.5]) {
          const flower = at(side * shoulderSpan * (down === 0.4 ? 0.2 : 0.14), torsoHeight * down);
          context.beginPath();
          context.arc(flower.x, flower.y, Math.max(2.2, shoulderSpan * 0.013), 0, Math.PI * 2);
          context.fill();
        }
      }
      context.restore();
    }
  }

  private drawSleeve(context: CanvasRenderingContext2D, shoulder: Point, elbow: Point, wrist: Point, shoulderSpan: number, scale: { width: number; length: number; sleeve: number }, color: string, accent: string, isAndean: boolean, isEmbroidered: boolean) {
    const end = this.scaleFrom(elbow, wrist, scale.sleeve);
    const upperNormal = this.segmentNormal(shoulder, elbow);
    const lowerNormal = this.segmentNormal(elbow, end);
    const upperHalf = shoulderSpan * 0.13 * scale.width;
    const elbowHalf = upperHalf * 0.78;
    const wristHalf = upperHalf * 0.62;
    const path = new Path2D();
    path.moveTo(shoulder.x + upperNormal.x * upperHalf, shoulder.y + upperNormal.y * upperHalf);
    path.quadraticCurveTo(elbow.x + lowerNormal.x * elbowHalf, elbow.y + lowerNormal.y * elbowHalf, end.x + lowerNormal.x * wristHalf, end.y + lowerNormal.y * wristHalf);
    path.lineTo(end.x - lowerNormal.x * wristHalf, end.y - lowerNormal.y * wristHalf);
    path.quadraticCurveTo(elbow.x - lowerNormal.x * elbowHalf, elbow.y - lowerNormal.y * elbowHalf, shoulder.x - upperNormal.x * upperHalf, shoulder.y - upperNormal.y * upperHalf);
    path.closePath();
    const fill = context.createLinearGradient(shoulder.x, shoulder.y, end.x, end.y);
    fill.addColorStop(0, this.shade(color, 12));
    fill.addColorStop(0.55, color);
    fill.addColorStop(1, this.shade(color, -13));
    context.fillStyle = fill;
    context.fill(path);
    context.shadowColor = "transparent";
    context.strokeStyle = "rgba(255,255,255,.25)";
    context.lineWidth = Math.max(1, shoulderSpan * 0.006);
    context.stroke(path);
    if (isAndean || isEmbroidered) {
      const start = this.lerp(elbow, end, 0.73);
      context.strokeStyle = accent;
      context.lineWidth = Math.max(isAndean ? 8 : 5, wristHalf * (isAndean ? 1.5 : .9));
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    }
  }

  private visible(landmarks: NormalizedLandmark[], indexes: number[], threshold: number) {
    return indexes.every((index) => {
      const point = landmarks[index];
      return point && Number.isFinite(point.x) && Number.isFinite(point.y) && (point.visibility ?? 0) >= threshold;
    });
  }

  private midpoint(a: Point, b: Point): Point { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  private lerp(a: Point, b: Point, amount: number): Point { return { x: a.x + (b.x - a.x) * amount, y: a.y + (b.y - a.y) * amount }; }
  private scaleFrom(origin: Point, point: Point, factor: number): Point { return { x: origin.x + (point.x - origin.x) * factor, y: origin.y + (point.y - origin.y) * factor }; }
  private segmentNormal(start: Point, end: Point): Point { const dx = end.x - start.x; const dy = end.y - start.y; const length = Math.max(0.001, Math.hypot(dx, dy)); return { x: -dy / length, y: dx / length }; }
  private unit(start: Point, end: Point): Point { const dx = end.x - start.x; const dy = end.y - start.y; const length = Math.max(0.001, Math.hypot(dx, dy)); return { x: dx / length, y: dy / length }; }
  private fillQuad(context: CanvasRenderingContext2D, a: Point, b: Point, c: Point, d: Point) { context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.lineTo(c.x, c.y); context.lineTo(d.x, d.y); context.closePath(); context.fill(); }
  private shade(hex: string, amount: number): string { const normalized = hex.replace("#", ""); if (normalized.length !== 6) return hex; const value = Number.parseInt(normalized, 16); const red = Math.max(0, Math.min(255, (value >> 16) + amount)); const green = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount)); const blue = Math.max(0, Math.min(255, (value & 255) + amount)); return `rgb(${red}, ${green}, ${blue})`; }

  private drawDebug(context: CanvasRenderingContext2D, landmarks: NormalizedLandmark[]) {
    if (landmarks.length < 25) return;
    const toPoint = (index: number) => ({ x: (1 - landmarks[index].x) * context.canvas.width, y: landmarks[index].y * context.canvas.height });
    context.save();
    context.strokeStyle = "rgba(214, 181, 119, .9)";
    context.fillStyle = "#fff8e9";
    context.lineWidth = 3;
    for (const [a, b] of CONNECTIONS) { const from = toPoint(a); const to = toPoint(b); context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); context.stroke(); }
    for (const index of [11, 12, 13, 14, 15, 16, 23, 24]) { const point = toPoint(index); context.beginPath(); context.arc(point.x, point.y, 5, 0, Math.PI * 2); context.fill(); }
    const shoulderCenter = this.midpoint(toPoint(11), toPoint(12));
    const hipCenter = this.midpoint(toPoint(23), toPoint(24));
    const chestCenter = this.lerp(shoulderCenter, hipCenter, .42);
    context.beginPath();
    context.moveTo(shoulderCenter.x, shoulderCenter.y);
    context.lineTo(hipCenter.x, hipCenter.y);
    context.stroke();
    for (const center of [shoulderCenter, chestCenter, hipCenter]) { context.beginPath(); context.arc(center.x, center.y, 5.5, 0, Math.PI * 2); context.fill(); }
    context.restore();
  }
}
