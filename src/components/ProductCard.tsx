import Link from "next/link";
import { GARMENT_AVAILABILITY } from "@/src/config/brand";
import type { Garment } from "@/src/types/garment";

export function ProductCard({ garment, index }: { garment: Garment; index: number }) {
  return (
    <article className={`product-card product-card--${garment.availability}`}>
      <Link href={`/producto/${garment.slug}`} className="product-image-wrap">
        <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
        <span className={`availability-badge availability-badge--${garment.availability}`}>
          {GARMENT_AVAILABILITY[garment.availability]}
        </span>
        <img
          src={garment.imageUrl}
          alt={`${garment.name}, ${garment.color}`}
          className={`product-image focus-${garment.imageFocus}`}
        />
        <span className="product-hover">Conocer esta pieza</span>
      </Link>
      <div className="product-copy">
        <div>
          <p className="eyebrow">{garment.pieceCode} · 1 DE 1</p>
          <h3><Link href={`/producto/${garment.slug}`}>{garment.name}</Link></h3>
          <span className="product-color">{garment.color}</span>
        </div>
        <Link className="round-link" href={`/producto/${garment.slug}`} aria-label={`Ver ${garment.name}`}>
          →
        </Link>
      </div>
    </article>
  );
}
