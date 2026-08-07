import Link from "next/link";
import type { Garment } from "@/src/types/garment";

export function ProductCard({ garment, index }: { garment: Garment; index: number }) {
  return (
    <article className="product-card">
      <Link href={`/producto/${garment.slug}`} className="product-image-wrap">
        <span className="product-index">0{index + 1}</span>
        <img
          src={garment.imageUrl}
          alt={garment.name}
          className={`product-image focus-${garment.imageFocus}`}
        />
        <span className="product-hover">Ver detalles</span>
      </Link>
      <div className="product-copy">
        <div>
          <p className="eyebrow">{garment.category}</p>
          <h3><Link href={`/producto/${garment.slug}`}>{garment.name}</Link></h3>
        </div>
        <Link className="round-link" href={`/probador?prenda=${garment.slug}`} aria-label={`Probar ${garment.name}`}>
          ↗
        </Link>
      </div>
    </article>
  );
}
