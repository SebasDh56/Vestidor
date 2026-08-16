import { ProductCard } from "@/src/components/ProductCard";
import { SiteHeader } from "@/src/components/SiteHeader";
import { listGarments } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const garments = await listGarments();
  const available = garments.filter((item) => item.availability === "available").length;
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="catalog-hero catalog-hero--unique">
        <p className="eyebrow">DROP 01 KILLAÉ · {garments.length} PIEZAS IRREPETIBLES</p>
        <h1>Elige la que<br /><em>solo existe una vez.</em></h1>
        <p>Todos pertenecen a la familia Abrigo Andino, pero cada color y detalle textil corresponde a una pieza concreta. Consulta el estado antes de reservar.</p>
      </section>
      <section className="catalog-body">
        <div className="catalog-filter"><span>{available} disponibles ahora</span><span>Sin variantes inventadas · Código individual · Reserva directa</span></div>
        <div className="product-grid product-grid--catalog">
          {garments.map((garment, index) => <ProductCard key={garment.slug} garment={garment} index={index} />)}
        </div>
        <p className="catalog-transparency">Las fotografías de modelo son representaciones comerciales generadas con IA a partir de las prendas reales. Antes de reservar, solicita medidas, video y fotografías de detalle por WhatsApp.</p>
      </section>
    </main>
  );
}
