import Link from "next/link";
import { BrandLogo } from "@/src/components/BrandLogo";
import { ProductCard } from "@/src/components/ProductCard";
import { SiteHeader } from "@/src/components/SiteHeader";
import { WHATSAPP_NUMBER } from "@/src/config/brand";
import { listGarments } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const garments = await listGarments();
  const heroPiece = garments.find((item) => item.slug === "abrigo-andino-luna-roja") ?? garments[0];
  const editorialPiece = garments.find((item) => item.slug === "abrigo-andino-noche-dorada") ?? garments[1] ?? garments[0];
  const availableCount = garments.filter((item) => item.availability === "available").length;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola KILLAÉ, quiero conocer las piezas únicas disponibles.")}`;

  return (
    <main>
      <section className="unique-hero">
        <SiteHeader />
        <div className="unique-hero-copy">
          <p className="hero-kicker">DROP 01 · ABRIGOS ANDINOS · ECUADOR</p>
          <h1>Ninguna vuelve<br /><em>a ser igual.</em></h1>
          <p className="hero-description">Abrigos contemporáneos con detalles textiles únicos. Cada pieza aparece una vez, se reserva directamente y conserva su propia historia.</p>
          <div className="hero-actions">
            <Link className="button button--dark" href="/catalogo">Descubrir las piezas</Link>
            <a className="text-link" href={whatsappUrl} target="_blank" rel="noreferrer">Hablar con KILLAÉ <span>↗</span></a>
          </div>
          <div className="hero-microfacts">
            <span><strong>{availableCount}</strong> disponibles ahora</span>
            <span><strong>1 de 1</strong> en cada diseño</span>
          </div>
        </div>
        {heroPiece && (
          <Link className="unique-hero-visual" href={`/producto/${heroPiece.slug}`}>
            <img src={heroPiece.imageUrl} alt={`${heroPiece.name}, abrigo andino de KILLAÉ`} />
            <div className="hero-piece-label">
              <span>{heroPiece.pieceCode} · PIEZA ÚNICA</span>
              <strong>{heroPiece.name}</strong>
              <small>Conocer la pieza →</small>
            </div>
          </Link>
        )}
      </section>

      <section className="brand-promises" aria-label="Principios de KILLAÉ">
        <span>Diseños irrepetibles</span><span>Hecho en Ecuador</span><span>Atención directa</span><span>Reserva por WhatsApp</span>
      </section>

      <section className="unique-intro" id="origen">
        <p className="eyebrow">KILLAÉ · ELEGANCIA DE RAÍZ</p>
        <div>
          <h2>Una raíz.<br />Una pieza.<br /><em>Tu historia.</em></h2>
          <div className="intro-copy">
            <p>No producimos un color infinitas veces. Seleccionamos abrigos con detalles propios y los presentamos tal como existen: una pieza concreta, disponible por tiempo limitado.</p>
            <p className="intro-note">La fotografía editorial muestra cómo puede lucir. Antes de reservar, puedes solicitar por WhatsApp un video real y las medidas exactas de la prenda.</p>
            <Link className="text-link" href="/catalogo">Ver el Drop 01 <span>→</span></Link>
          </div>
        </div>
      </section>

      <section className="collection-section" id="coleccion">
        <div className="section-heading">
          <div><p className="eyebrow">DROP 01 · EDICIÓN IRREPETIBLE</p><h2>Cuatro piezas. Ninguna repetida.</h2></div>
          <p>Cada código identifica una prenda real. Si se vende, permanece visible como parte del archivo KILLAÉ.</p>
        </div>
        <div className="product-grid">
          {garments.map((garment, index) => <ProductCard key={garment.slug} garment={garment} index={index} />)}
        </div>
        <div className="center-action"><Link className="button button--outline" href="/catalogo">Explorar el drop completo</Link></div>
      </section>

      <section className="drop-process">
        <div className="choice-heading"><p className="eyebrow">COMPRAR SIN COMPLICARLO</p><h2>La ves.<br /><em>La confirmas.</em><br />La reservas.</h2></div>
        <ol>
          <li><span>01</span><div><h3>Descubre la pieza</h3><p>Revisa color, corte y detalles de cada abrigo. No mostramos variantes que no existen.</p></div></li>
          <li><span>02</span><div><h3>Pide la evidencia real</h3><p>Solicita medidas, video y acercamientos del tejido directamente por WhatsApp.</p></div></li>
          <li><span>03</span><div><h3>Reserva con atención humana</h3><p>Confirmamos disponibilidad y entrega antes de cualquier pago. Sin carrito ni cobros automáticos.</p></div></li>
        </ol>
      </section>

      {editorialPiece && (
        <section className="editorial-block editorial-block--unique">
          <div className="editorial-image"><img src={editorialPiece.imageUrl} alt={`${editorialPiece.name}, pieza única KILLAÉ`} /></div>
          <div className="editorial-copy">
            <p className="eyebrow">EL VALOR DE LO IRREPETIBLE</p>
            <h2>Vestir algo<br /><em>que no se repite.</em></h2>
            <p>La identidad no nace de tener más opciones, sino de elegir una pieza con presencia propia. Cada abrigo KILLAÉ recibe nombre, código y seguimiento individual.</p>
            <Link className="text-link" href={`/producto/${editorialPiece.slug}`}>Conocer {editorialPiece.name} <span>→</span></Link>
            <span className="editorial-number">1/1</span>
          </div>
        </section>
      )}

      <section className="whatsapp-cta">
        <p className="eyebrow">ATENCIÓN DIRECTA</p>
        <h2>¿Una pieza habló contigo?</h2>
        <p>Escríbenos para comprobar medidas, recibir un video real y reservarla antes de que pase al archivo.</p>
        <a className="button button--light" href={whatsappUrl} target="_blank" rel="noreferrer">Consultar por WhatsApp <span>↗</span></a>
      </section>

      <footer className="site-footer">
        <div><BrandLogo /><p>Elegancia de raíz.<br />Piezas que no se repiten.</p></div>
        <div><p className="eyebrow">EXPLORA</p><Link href="/catalogo">Piezas únicas</Link><Link href="/probador">Vista orientativa</Link><Link href="/#origen">Nuestra raíz</Link></div>
        <div><p className="eyebrow">COMPRA DIRECTA</p><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><span>Envíos en Ecuador</span><Link href="/admin">Administración</Link></div>
        <p className="footer-bottom">© 2026 KILLAÉ · ELEGANCIA DE RAÍZ · ECUADOR</p>
      </footer>
    </main>
  );
}
