"use client";

import { useMemo, useState } from "react";
import { WHATSAPP_NUMBER } from "@/src/config/brand";
import type { Garment } from "@/src/types/garment";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "Necesito asesoría"];

export function ProductRequestForm({ garment }: { garment: Garment }) {
  const [size, setSize] = useState("Necesito asesoría");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState("");

  const message = useMemo(() => [
    "Hola, quiero consultar una pieza única de KILLAÉ:",
    `Código: ${garment.pieceCode}`,
    `Pieza: ${garment.name}`,
    `Color: ${garment.color}`,
    `Mi talla habitual: ${size}`,
    city ? `Ciudad: ${city}` : "",
    notes ? `Comentario: ${notes}` : "",
    "¿Me envían medidas, video real y disponibilidad antes de reservar?",
  ].filter(Boolean).join("\n"), [city, garment, notes, size]);

  if (garment.availability === "sold") {
    return (
      <div className="sold-message">
        <p className="eyebrow">PIEZA VENDIDA</p>
        <h2>Ya forma parte del archivo KILLAÉ.</h2>
        <a className="button button--dark" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola KILLAÉ, me gustó ${garment.name}. Quiero conocer el próximo lanzamiento similar.`)}`}>Avisarme del próximo drop</a>
      </div>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Escribe tu nombre y número de WhatsApp.");
      return;
    }
    setState("saving");
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garmentSlug: garment.slug,
          garmentName: `${garment.pieceCode} · ${garment.name}`,
          color: garment.color,
          size,
          customerName: name,
          customerPhone: phone,
          city,
          notes,
        }),
      });
    } finally {
      setState("idle");
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`${message}\n\nMi nombre: ${name}\nMi WhatsApp: ${phone}`)}`;
    }
  }

  return (
    <form className="request-form" onSubmit={submit}>
      <div className="request-heading">
        <p className="eyebrow">CONSULTA Y RESERVA</p>
        <h2>{garment.availability === "reserved" ? "Únete a la lista" : "Confirma esta pieza"}</h2>
        <p>{garment.availability === "reserved" ? "La pieza está reservada temporalmente. Déjanos tu contacto por si vuelve a estar disponible." : "No cobramos desde la página. Primero verificamos contigo medidas, estado y entrega."}</p>
      </div>

      <fieldset className="request-sizes">
        <legend>Tu talla habitual</legend>
        <div className="request-size-options">{SIZE_OPTIONS.map((item) => <button type="button" key={item} className={size === item ? "active" : ""} onClick={() => setSize(item)}>{item}</button>)}</div>
      </fieldset>

      <div className="request-fields">
        <label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Tu nombre" /></label>
        <label>Tu WhatsApp<input value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" placeholder="09..." /></label>
        <label>Ciudad<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ej. Quito" /></label>
        <label>Comentario<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Altura, ajuste o fecha" /></label>
      </div>
      <button className="button button--dark button--full" disabled={state === "saving"}>{state === "saving" ? "Preparando consulta…" : "Continuar por WhatsApp"} <span>↗</span></button>
      {error && <p className="form-message form-message--error">{error}</p>}
      <p className="request-privacy">Guardamos únicamente lo necesario para responder. No solicitamos pagos ni datos bancarios en esta página.</p>
    </form>
  );
}
