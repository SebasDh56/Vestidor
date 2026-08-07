import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/SiteHeader";
import { getGarmentBySlug } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const garment = await getGarmentBySlug(slug);
  if (!garment) notFound();

  return (
    <main className="inner-page product-page">
      <SiteHeader />
      <section className="product-detail">
        <div className="product-detail-image">
          <img src={garment.imageUrl} alt={garment.name} className={`focus-${garment.imageFocus}`} />
          <span>VISTA DE REFERENCIA</span>
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{garment.category}</p>
          <h1>{garment.name}</h1>
          <p className="product-lead">{garment.description}</p>
          <dl><div><dt>Color</dt><dd>{garment.color}</dd></div><div><dt>Material</dt><dd>{garment.material}</dd></div><div><dt>Disponibilidad</dt><dd>Pieza de exhibición</dd></div></dl>
          <div className="product-sizes"><span>Tallas configuradas</span><div>{garment.sizes.map((size) => <span key={size}>{size}</span>)}</div></div>
          <Link className="button button--dark button--full" href={`/probador?prenda=${garment.slug}`}>Probar con mi cámara <span>↗</span></Link>
          <p className="privacy-note">La cámara se procesa de forma temporal en tu navegador.</p>
        </div>
      </section>
    </main>
  );
}
