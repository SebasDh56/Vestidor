import Link from "next/link";
import { BrandLogo } from "@/src/components/BrandLogo";
import { CombinationCollection } from "@/src/components/CombinationCollection";
import { SiteHeader } from "@/src/components/SiteHeader";
import { WHATSAPP_NUMBER } from "@/src/config/brand";
import { COMBINATION_COUNT } from "@/src/data/combinations";
import { listGarments } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const garments = await listGarments();
  const heroPiece = garments.find((item) => item.slug === "abrigo-andino-luna-roja") ?? garments[0];
  const editorialPiece = garments.find((item) => item.slug === "abrigo-andino-noche-dorada") ?? garments[1] ?? garments[0];
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola KILLAÉ, quiero conocer las combinaciones disponibles del Abrigo Andino.")}`;

  return (
    <main>
      <section className="unique-hero">
        <SiteHeader />
        <div className="unique-hero-copy">
          <p className="hero-kicker">ABRIGO ANDINO · COMBINACIONES POR TALLA · ECUADOR</p>
          <h1>Tu talla.<br />Tu combinación.<br /><em>Tu raíz.</em></h1>
          <p className="hero-description">Nuestra silueta estrella se transforma con colores y tejidos andinos distintos. Elige primero tu talla y descubre la combinación disponible para ti.</p>
          <div className="hero-actions">
            <Link className="button button--dark" href="/#combinaciones">Conocer combinaciones</Link>
            <a className="text-link" href={whatsappUrl} target="_blank" rel="noreferrer">Hablar con KILLAÉ <span>↗</span></a>
          </div>
          <div className="hero-microfacts">
            <span><strong>{COMBINATION_COUNT}</strong> combinaciones actuales</span>
            <span><strong>Niñas · S · M</strong> tallas disponibles</span>
          </div>
        </div>
        {heroPiece && (
          <Link className="unique-hero-visual" href="/catalogo">
            <img src={heroPiece.imageUrl} alt={`${heroPiece.name}, abrigo andino de KILLAÉ`} />
            <div className="hero-piece-label">
              <span>ABRIGO ANDINO · SILUETA ESTRELLA</span>
              <strong>Elige tu combinación</strong>
              <small>Ver el modelo →</small>
            </div>
          </Link>
        )}
      </section>

      <section className="brand-promises" aria-label="Principios de KILLAÉ">
        <span>Un modelo estrella</span><span>Tejidos andinos</span><span>Combinaciones por talla</span><span>Reserva por WhatsApp</span>
      </section>

      <section className="unique-intro" id="origen">
        <p className="eyebrow">KILLAÉ · ELEGANCIA DE RAÍZ</p>
        <div>
          <h2>Una forma.<br />Muchos colores.<br /><em>Tu elección.</em></h2>
          <div className="intro-copy">
            <p>El Abrigo Andino mantiene su corte reconocible y cambia en la combinación de paño, puños y bolsillos. Así puedes comparar con claridad lo que existe en cada talla.</p>
            <p className="intro-note">Cada código corresponde a una combinación real. Antes de reservar, solicita por WhatsApp medidas, disponibilidad y una fotografía completa de la prenda.</p>
            <Link className="text-link" href="/#combinaciones">Elegir talla y combinación <span>→</span></Link>
          </div>
        </div>
      </section>

      <CombinationCollection />

      <section className="drop-process">
        <div className="choice-heading"><p className="eyebrow">COMPRAR SIN COMPLICARLO</p><h2>La ves.<br /><em>La confirmas.</em><br />La reservas.</h2></div>
        <ol>
          <li><span>01</span><div><h3>Empieza por tu talla</h3><p>Elige Niñas, S o M para ver solamente las combinaciones preparadas en esa medida.</p></div></li>
          <li><span>02</span><div><h3>Escoge tu combinación</h3><p>Compara el paño y el detalle textil de puños y bolsillos. Cada opción tiene un código claro.</p></div></li>
          <li><span>03</span><div><h3>Reserva con atención humana</h3><p>Confirmamos disponibilidad y entrega antes de cualquier pago. Sin carrito ni cobros automáticos.</p></div></li>
        </ol>
      </section>

      {editorialPiece && (
        <section className="editorial-block editorial-block--unique">
          <div className="editorial-image"><img src={editorialPiece.imageUrl} alt={`${editorialPiece.name}, pieza única KILLAÉ`} /></div>
          <div className="editorial-copy">
            <p className="eyebrow">NUESTRA SILUETA ESTRELLA</p>
            <h2>El mismo abrigo.<br /><em>Otra expresión.</em></h2>
            <p>El corte del Abrigo Andino crea la identidad de la colección. Los colores y detalles tejidos hacen que cada combinación tenga una presencia distinta.</p>
            <Link className="text-link" href="/#combinaciones">Comparar combinaciones <span>→</span></Link>
            <span className="editorial-number">01–10</span>
          </div>
        </section>
      )}

      <section className="whatsapp-cta">
        <p className="eyebrow">ATENCIÓN DIRECTA</p>
        <h2>¿Ya encontraste tu combinación?</h2>
        <p>Escríbenos con el código y la talla para confirmar medidas, disponibilidad y recibir una fotografía real.</p>
        <a className="button button--light" href={whatsappUrl} target="_blank" rel="noreferrer">Consultar por WhatsApp <span>↗</span></a>
      </section>

      <footer className="site-footer">
        <div><BrandLogo /><p>Elegancia de raíz.<br />Tu talla, tu combinación.</p></div>
        <div><p className="eyebrow">EXPLORA</p><Link href="/catalogo">Combinaciones</Link><Link href="/probador">Vista orientativa</Link><Link href="/#origen">Nuestra raíz</Link></div>
        <div><p className="eyebrow">COMPRA DIRECTA</p><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><span>Envíos en Ecuador</span><Link href="/admin">Administración</Link></div>
        <p className="footer-bottom">© 2026 KILLAÉ · ELEGANCIA DE RAÍZ · ECUADOR</p>
      </footer>
    </main>
  );
}
