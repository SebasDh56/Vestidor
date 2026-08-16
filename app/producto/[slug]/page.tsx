import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/SiteHeader";
import { ProductRequestForm } from "@/src/components/ProductRequestForm";
import { GARMENT_AVAILABILITY } from "@/src/config/brand";
import { getGarmentBySlug } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const garment = await getGarmentBySlug(slug);
  if (!garment) notFound();

  return (
    <main className="inner-page product-page">
      <SiteHeader />
      <section className="product-detail product-detail--unique">
        <figure className="product-detail-image product-hero-figure">
          <img src={garment.imageUrl} alt={`${garment.name}, ${garment.color}`} className={`focus-${garment.imageFocus}`} />
          <figcaption>Imagen comercial generada con IA a partir de la prenda real.</figcaption>
        </figure>
        <div className="product-detail-copy">
          <div className="product-title-line">
            <p className="eyebrow">{garment.pieceCode} · 1 DE 1</p>
            <span className={`availability-badge availability-badge--${garment.availability}`}>{GARMENT_AVAILABILITY[garment.availability]}</span>
          </div>
          <h1>{garment.name}</h1>
          <p className="product-lead">{garment.description}</p>
          <dl>
            <div><dt>Familia</dt><dd>Abrigo Andino</dd></div>
            <div><dt>Color real</dt><dd>{garment.color}</dd></div>
            <div><dt>Material</dt><dd>{garment.material}</dd></div>
            <div><dt>Disponibilidad</dt><dd>{GARMENT_AVAILABILITY[garment.availability]} · {garment.units} pieza</dd></div>
            <div><dt>Talla y medidas</dt><dd>Se confirman sobre la prenda real por WhatsApp</dd></div>
          </dl>
          <div className="reality-check">
            <strong>Compra con evidencia real</strong>
            <p>Solicita video, medidas y acercamientos de puños, botones y tejido antes de reservar.</p>
          </div>
          <ProductRequestForm garment={garment} />
          <Link className="text-link product-tryon-link" href={`/probador?prenda=${garment.slug}`}>Ver proporción orientativa <span>↗</span></Link>
          <p className="privacy-note">La vista de cámara es una guía de proporción y color. No sustituye la fotografía ni las medidas de la pieza real.</p>
        </div>
      </section>
    </main>
  );
}
