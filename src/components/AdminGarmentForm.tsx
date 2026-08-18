"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_IMAGE_BYTES = 1_400_000;
const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 2000;

async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Selecciona una imagen JPG, PNG o WebP.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(
      1,
      MAX_IMAGE_WIDTH / bitmap.width,
      MAX_IMAGE_HEIGHT / bitmap.height,
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la fotograf\u00eda.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let quality = 0.88;
    let result: Blob | null = null;
    while (quality >= 0.5) {
      result = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
      );
      if (result && result.size <= MAX_IMAGE_BYTES) break;
      quality -= 0.08;
    }
    if (!result || result.size > MAX_IMAGE_BYTES) {
      throw new Error("La fotograf\u00eda sigue siendo demasiado pesada despu\u00e9s de optimizarla.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "prenda";
    return new File([result], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}

export function AdminGarmentForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setState("saving");
    setMessage("Preparando la fotograf\u00eda para publicarla\u2026");
    try {
      const image = formData.get("image");
      if (image instanceof File && image.size > 0) {
        formData.set("image", await optimizeImage(image));
      }
      const response = await fetch("/api/garments", { method: "POST", body: formData });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo guardar la pieza.");
      formRef.current?.reset();
      setState("success");
      setMessage("Pieza publicada en el catálogo.");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
  }

  return (
    <form ref={formRef} action={submit} className="admin-form">
      <div className="field-grid">
        <label>Código único<input name="pieceCode" required placeholder="Ej. KAE-A05" /></label>
        <label>Nombre de la pieza<input name="name" required placeholder="Ej. Tierra Serena" /></label>
        <label>Categoría<input name="category" defaultValue="Abrigo Andino · Pieza única" required /></label>
        <label>Color real<input name="color" required placeholder="Camel con acentos turquesa" /></label>
        <label>Material<input name="material" required placeholder="Paño con aplicación textil" /></label>
        <label>Estado<select name="availability" defaultValue="available"><option value="available">Disponible</option><option value="reserved">Reservada</option><option value="sold">Vendida</option></select></label>
        <label>Unidades<input name="units" type="number" min="1" max="20" defaultValue="1" required /></label>
      </div>
      <label>Descripción<textarea name="description" required rows={4} placeholder="Describe el corte y los detalles reales de esta pieza." /></label>
      <div className="field-grid colors-grid">
        <label>Color de vista AR<input name="overlayColor" type="color" defaultValue="#c6b39a" /></label>
        <label>Acento de vista AR<input name="overlayAccent" type="color" defaultValue="#a6462e" /></label>
      </div>
      <label className="file-field">Imagen principal <span>JPG, PNG o WebP · se optimiza automáticamente</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
      <button className="button button--dark" disabled={state === "saving"}>{state === "saving" ? "Guardando…" : "Publicar pieza única"}</button>
      {message && <p className={`form-message form-message--${state}`}>{message}</p>}
    </form>
  );
}
