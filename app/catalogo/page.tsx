import { CombinationCollection } from "@/src/components/CombinationCollection";
import { SiteHeader } from "@/src/components/SiteHeader";
import { COMBINATION_COUNT } from "@/src/data/combinations";

export const dynamic = "force-dynamic";

export default function CatalogPage() {
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="catalog-hero catalog-hero--unique">
        <p className="eyebrow">KILLAÉ · ABRIGO ANDINO · {COMBINATION_COUNT} COMBINACIONES</p>
        <h1>Conoce los colores<br /><em>y diseños por talla.</em></h1>
        <p>Primero identifica tu talla disponible; después compara el paño y los detalles textiles de cada código. Una forma simple de encontrar tu Abrigo Andino.</p>
      </section>
      <CombinationCollection catalog />
      <p className="catalog-transparency">Las láminas muestran las combinaciones disponibles de paño y detalle textil; las modelos son visualizaciones editoriales con IA. Antes de reservar, solicita por WhatsApp medidas y fotografías completas de la prenda real.</p>
    </main>
  );
}
