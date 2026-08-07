"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminGarmentForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/garments", { method: "POST", body: formData });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo guardar la prenda.");
      formRef.current?.reset();
      setState("success");
      setMessage("Prenda publicada en el catálogo.");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
  }

  return (
    <form ref={formRef} action={submit} className="admin-form">
      <div className="field-grid">
        <label>Nombre<input name="name" required placeholder="Ej. Chaqueta Killa" /></label>
        <label>Categoría<input name="category" required placeholder="Chaquetas" /></label>
        <label>Material<input name="material" required placeholder="Paño artesanal" /></label>
        <label>Color<input name="color" required placeholder="Marfil natural" /></label>
      </div>
      <label>Descripción<textarea name="description" required rows={4} placeholder="Describe el corte, textura y detalles artesanales." /></label>
      <div className="field-grid colors-grid">
        <label>Color virtual<input name="overlayColor" type="color" defaultValue="#c6b39a" /></label>
        <label>Acento virtual<input name="overlayAccent" type="color" defaultValue="#a6462e" /></label>
      </div>
      <label className="file-field">
        Imagen de la prenda <span>JPG, PNG o WebP · máximo 5 MB</span>
        <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
      </label>
      <button className="button button--dark" disabled={state === "saving"}>
        {state === "saving" ? "Guardando…" : "Publicar prenda"}
      </button>
      {message && <p className={`form-message form-message--${state}`}>{message}</p>}
    </form>
  );
}
