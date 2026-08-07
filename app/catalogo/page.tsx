import { ProductCard } from "@/src/components/ProductCard";
import { SiteHeader } from "@/src/components/SiteHeader";
import { listGarments } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const garments = await listGarments();
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="catalog-hero">
        <p className="eyebrow">COLECCIÓN 01 · {garments.length} PIEZAS</p>
        <h1>Una colección<br /><em>con raíz.</em></h1>
        <p>Chaquetas y abrigos seleccionados para explorar su forma, detalle y ajuste virtual.</p>
      </section>
      <section className="catalog-body">
        <div className="catalog-filter"><span>Todas las piezas</span><span>Orden · Editorial</span></div>
        <div className="product-grid product-grid--catalog">
          {garments.map((garment, index) => <ProductCard key={garment.slug} garment={garment} index={index} />)}
        </div>
      </section>
    </main>
  );
}
