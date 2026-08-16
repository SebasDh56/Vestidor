"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/src/components/BrandLogo";
import { BodyTrackingEngine } from "@/src/engines/BodyTrackingEngine";
import { SizeRecommendationEngine } from "@/src/engines/SizeRecommendationEngine";
import { VirtualTryOnEngine } from "@/src/engines/VirtualTryOnEngine";
import type {
  Garment,
  GarmentSize,
  NormalizedLandmark,
  SizeRecommendation,
} from "@/src/types/garment";

type CameraState = "idle" | "requesting" | "loading-model" | "ready" | "error";

const trackingEngine = new BodyTrackingEngine();
const fittingEngine = new VirtualTryOnEngine();
const recommendationEngine = new SizeRecommendationEngine();

export function CameraTryOn({
  garments,
  initialSlug,
}: {
  garments: Garment[];
  initialSlug?: string;
}) {
  const initial = garments.find((item) => item.slug === initialSlug) ?? garments[0];
  const [garment, setGarment] = useState(initial);
  const [size, setSize] = useState<GarmentSize>("M");
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [statusMessage, setStatusMessage] = useState("Cámara apagada");
  const [error, setError] = useState("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [debug, setDebug] = useState(false);
  const [fps, setFps] = useState(0);
  const [heightCm, setHeightCm] = useState(165);
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const lastDetectionRef = useRef(0);
  const frameCounterRef = useRef({ count: 0, startedAt: 0 });
  const lastRecommendationRef = useRef(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const openCamera = useCallback(async (requestedDeviceId?: string) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Tu navegador no permite usar la cámara desde esta página.");
      setCameraState("error");
      return;
    }

    setError("");
    setCameraState("requesting");
    setStatusMessage("Solicitando permiso…");
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: requestedDeviceId
          ? { deviceId: { exact: requestedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const available = (await navigator.mediaDevices.enumerateDevices()).filter(
        (device) => device.kind === "videoinput",
      );
      setDevices(available);
      const activeId = stream.getVideoTracks()[0]?.getSettings().deviceId ?? "";
      setDeviceId(activeId);
      setCameraState("loading-model");
      setStatusMessage("Preparando seguimiento corporal…");
      await trackingEngine.initialize();
      setCameraState("ready");
      setStatusMessage("Colócate frente a la cámara");
    } catch (cause) {
      stopStream();
      const name = cause instanceof DOMException ? cause.name : "";
      const message =
        name === "NotAllowedError"
          ? "Necesitamos permiso de cámara. Puedes habilitarlo desde la barra del navegador."
          : name === "NotFoundError"
            ? "No encontramos una cámara disponible."
            : "No pudimos iniciar la cámara. Revisa que otra aplicación no la esté usando.";
      setError(message);
      setCameraState("error");
      setStatusMessage("Cámara no disponible");
    }
  }, [stopStream]);

  useEffect(() => () => {
    stopStream();
    trackingEngine.close();
  }, [stopStream]);

  useEffect(() => {
    void fittingEngine.prepareGarment(garment);
  }, [garment]);

  useEffect(() => {
    if (cameraState !== "ready") return;
    let animationFrame = 0;
    let cancelled = false;

    const render = (now: number) => {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (now - lastDetectionRef.current > 60) {
          const detected = trackingEngine.detect(video, now);
          lastDetectionRef.current = now;
          landmarksRef.current = detected;

          const meter = frameCounterRef.current;
          if (!meter.startedAt) meter.startedAt = now;
          meter.count += 1;
          if (now - meter.startedAt > 700) {
            setFps(Math.round((meter.count * 1000) / (now - meter.startedAt)));
            frameCounterRef.current = { count: 0, startedAt: now };
          }
        }

        const landmarks = landmarksRef.current;
        const context = canvas.getContext("2d");
        if (context && landmarks) {
          fittingEngine.render(context, landmarks, garment, size, debug);
          const shouldersVisible =
            (landmarks[11]?.visibility ?? 0) > 0.55 &&
            (landmarks[12]?.visibility ?? 0) > 0.55;
          const visibleHips = [23, 24].filter(
            (index) => (landmarks[index]?.visibility ?? 0) > 0.42,
          ).length;
          const armsVisible = [13, 14, 15, 16].filter(
            (index) => (landmarks[index]?.visibility ?? 0) > 0.42,
          ).length >= 3;
          const shoulderSpan = Math.abs((landmarks[11]?.x ?? 0) - (landmarks[12]?.x ?? 0));
          if (!shouldersVisible) setStatusMessage("Deja visibles ambos hombros");
          else if (visibleHips === 0) setStatusMessage("Aléjate hasta mostrar la cadera");
          else if (visibleHips === 1) setStatusMessage("Gira suavemente hacia el frente");
          else if (shoulderSpan < 0.14) setStatusMessage("Acércate un poco");
          else if (shoulderSpan > 0.55) setStatusMessage("Aléjate un poco");
          else if (!armsVisible) setStatusMessage("Separa ligeramente los brazos");
          else setStatusMessage("Ajuste corporal estable");

          if (now - lastRecommendationRef.current > 900) {
            const next = recommendationEngine.recommend(landmarks, heightCm, garment);
            setRecommendation(next);
            if (next && size === "M") setSize(next.recommendedSize);
            lastRecommendationRef.current = now;
          }
        } else if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          setStatusMessage("Colócate frente a la cámara");
        }
      }
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    };
  }, [cameraState, debug, garment, heightCm, size]);

  const confidence = useMemo(
    () => recommendation ? Math.round(recommendation.confidence * 100) : null,
    [recommendation],
  );

  function exitTryOn() {
    stopStream();
    trackingEngine.close();
    landmarksRef.current = null;
    canvasRef.current?.getContext("2d")?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setCameraState("idle");
    setStatusMessage("Cámara apagada");
    setRecommendation(null);
    setFps(0);
  }

  function capture() {
    const video = videoRef.current;
    const overlay = canvasRef.current;
    if (!video || !overlay) return;
    const output = document.createElement("canvas");
    output.width = video.videoWidth;
    output.height = video.videoHeight;
    const context = output.getContext("2d");
    if (!context) return;
    context.translate(output.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, output.width, output.height);
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.drawImage(overlay, 0, 0);
    output.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `killae-${garment.slug}.jpg`;
      anchor.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.92);
  }

  return (
    <main className="tryon-page">
      <header className="tryon-header">
        <BrandLogo compact />
        <div><span className="live-dot" /> {cameraState === "ready" ? "Seguimiento corporal" : "Vista orientativa"}</div>
        <Link href="/catalogo">Cerrar</Link>
      </header>

      <section className="tryon-shell">
        <div className="camera-stage">
          <video ref={videoRef} className="camera-video" playsInline muted />
          <canvas ref={canvasRef} className="camera-overlay" />
          <div className="camera-topline">
            <span className={`tracking-status tracking-status--${cameraState}`}>{statusMessage}</span>
            {cameraState === "ready" && <span>{fps} FPS</span>}
          </div>

          {cameraState !== "ready" && (
            <div className="camera-empty">
              <span className="camera-frame" />
              <p className="eyebrow">VISTA PRIVADA KILLAÉ</p>
              <h1>Su proporción.<br />Sobre tu silueta.</h1>
              <p>Esta herramienta orienta largo y volumen; no intenta reemplazar la fotografía real. La imagen se procesa en tu dispositivo. Colócate de frente y deja visibles hombros, brazos y cadera.</p>
              <button className="button button--light" onClick={() => void openCamera()} disabled={cameraState === "requesting" || cameraState === "loading-model"}>
                {cameraState === "requesting" ? "Solicitando permiso…" : cameraState === "loading-model" ? "Preparando AR…" : "Activar cámara"}
              </button>
              {error && <p className="camera-error">{error}</p>}
            </div>
          )}

          {cameraState === "ready" && (
            <div className="camera-actions">
              <button onClick={capture}>Capturar</button>
              <button onClick={() => setDebug((value) => !value)} aria-pressed={debug}>{debug ? "Ocultar puntos" : "Ver puntos"}</button>
              <button onClick={exitTryOn}>Salir</button>
            </div>
          )}
        </div>

        <aside className="tryon-panel">
          <div className="tryon-panel-heading">
            <p className="eyebrow">Pieza seleccionada · {garment.pieceCode}</p>
            <h2>{garment.name}</h2>
            <p>{garment.color} · {garment.material}</p>
          </div>

          {devices.length > 1 && (
            <label className="camera-select">Cámara
              <select value={deviceId} onChange={(event) => void openCamera(event.target.value)}>
                {devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Cámara ${index + 1}`}</option>)}
              </select>
            </label>
          )}

          <div className="recommendation-card">
            <span>Talla sugerida</span>
            <strong>{recommendation?.recommendedSize ?? "—"}</strong>
            <small>{confidence ? `${confidence}% de confianza · ${recommendation?.fitDescription}` : "Completa el encuadre para calcularla"}</small>
          </div>

          <label className="height-control">
            <span>Tu altura aproximada <strong>{heightCm} cm</strong></span>
            <input type="range" min="145" max="195" value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} />
          </label>

          <fieldset className="size-picker">
            <legend>¿Cómo quieres probarla?</legend>
            <div>{garment.sizes.map((option) => <button type="button" key={option} className={size === option ? "active" : ""} onClick={() => setSize(option)}>{option}</button>)}</div>
            <small>La talla modifica hombros, largo y mangas de forma independiente.</small>
          </fieldset>

          <div className="camera-piece-color">
            <span style={{ backgroundColor: garment.overlayColor }} />
            <div><strong>{garment.color}</strong><small>Color fijo de esta pieza. No generamos variantes inexistentes.</small></div>
          </div>

          <div className="tryon-products">
            <p>CAMBIAR PRENDA</p>
            <div>
              {garments.map((item) => (
                <button key={item.slug} className={item.slug === garment.slug ? "active" : ""} onClick={() => { setGarment(item); setRecommendation(null); }} aria-label={item.name}>
                  <img src={item.imageUrl} alt="" className={`focus-${item.imageFocus}`} />
                </button>
              ))}
            </div>
          </div>

          <p className="tryon-disclaimer">KILLAÉ usa puntos de hombros, torso, codos y muñecas para orientar proporción. La forma es aproximada y no sustituye el video, las medidas ni una prueba física.</p>
        </aside>
      </section>
    </main>
  );
}
