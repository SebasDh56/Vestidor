import Link from "next/link";
import { BrandLogo } from "@/src/components/BrandLogo";
import { CapsCollection } from "@/src/components/CapsCollection";
import { CombinationCollection } from "@/src/components/CombinationCollection";
import { SiteHeader } from "@/src/components/SiteHeader";
import { WHATSAPP_NUMBER } from "@/src/config/brand";
import { COMBINATION_COUNT } from "@/src/data/combinations";

export const dynamic = "force-dynamic";

export default function Home() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola KILLAÉ, quiero conocer las piezas disponibles hoy y recibir fotografías reales antes de reservar.")}`;

  return (
    <main>
      <section className="unique-hero">
        <SiteHeader />
        <div className="unique-hero-copy">
          <p className="hero-kicker">PIEZAS ÚNICAS · MANOS LOCALES · ECUADOR</p>
          <h1>Tu talla.<br />Tu combinación.<br /><em>Tu raíz.</em></h1>
          <p className="hero-description">Elegimos cada pieza una a una y trabajamos cerca de quienes confeccionan y bordan localmente. Conoce lo disponible, mira la pieza real y reserva con atención humana.</p>
          <div className="hero-actions">
            <Link className="button button--dark" href="/#combinaciones">Descubrir abrigos</Link>
            <Link className="text-link" href="/#gorras">Explorar gorras <span>→</span></Link>
          </div>
          <div className="hero-microfacts">
            <span><strong>{COMBINATION_COUNT}</strong> combinaciones reales de abrigo</span>
            <span><strong>Foto real</strong> antes de reservar</span>
          </div>
        </div>
        <Link className="unique-hero-visual" href="/catalogo">
          <img src="/images/models/abrigo-andino-talla-s-combinacion-04-v6.webp" alt="Tierra Serena, Abrigo Andino abierto KILLAÉ en talla S con tres botones forrados" />
          <div className="hero-piece-label">
            <span>ABRIGO ANDINO · COMBINACIÓN 04 · TALLA S</span>
            <strong>Elige tu combinación</strong>
            <small>Ver el modelo →</small>
          </div>
        </Link>
      </section>

      <section className="brand-promises" aria-label="Principios de KILLAÉ">
        <span>Trabajo local cercano</span><span>Piezas que no se repiten</span><span>Disponibilidad real</span><span>Reserva por WhatsApp</span>
      </section>

      <section className="unique-intro" id="origen">
        <p className="eyebrow">KILLAÉ · ELEGANCIA DE RAÍZ</p>
        <div>
          <h2>Diseño con origen.<br />Piezas con<br /><em>carácter.</em></h2>
          <div className="intro-copy">
            <p>No buscamos llenar un catálogo con copias. Presentamos combinaciones reales y mantenemos una relación cercana con las personas que confeccionan y bordan en Ecuador.</p>
            <p className="intro-note">Comprar KILLAÉ pone en valor el oficio local. Antes de reservar te confirmamos medidas, disponibilidad y te mostramos la pieza exacta que recibirás.</p>
            <a className="text-link" href={whatsappUrl} target="_blank" rel="noreferrer">Conocer lo disponible <span>↗</span></a>
          </div>
        </div>
      </section>

      <CombinationCollection />

      <section className="drop-process">
        <div className="choice-heading"><p className="eyebrow">COMPRAR SIN COMPLICARLO</p><h2>La ves.<br /><em>La confirmas.</em><br />La reservas.</h2></div>
        <ol>
          <li><span>01</span><div><h3>Empieza por tu talla</h3><p>Elige Niñas, S, M o L para ver solamente las combinaciones preparadas en esa medida.</p></div></li>
          <li><span>02</span><div><h3>Escoge tu combinación</h3><p>Compara el paño y el detalle textil de puños y bolsillos. Cada opción tiene un código claro.</p></div></li>
          <li><span>03</span><div><h3>Reserva con atención humana</h3><p>Confirmamos disponibilidad y entrega antes de cualquier pago. Sin carrito ni cobros automáticos.</p></div></li>
        </ol>
      </section>

      <section className="editorial-block editorial-block--unique">
          <div className="editorial-image"><img src="/images/models/abrigo-andino-talla-m-combinacion-08-v6.webp" alt="Noche Andina, Abrigo Andino abierto KILLAÉ en talla M con tres botones forrados" /></div>
          <div className="editorial-copy">
            <p className="eyebrow">UNA COMPRA MÁS HUMANA</p>
            <h2>Conoces la pieza.<br /><em>Antes de elegirla.</em></h2>
            <p>El Abrigo Andino conserva su silueta abierta; el paño y los detalles finos de puños y bolsillos cambian en cada combinación. Te mostramos la prenda real para comprar con claridad.</p>
            <Link className="text-link" href="/#combinaciones">Comparar combinaciones <span>→</span></Link>
            <span className="editorial-number">01–13</span>
          </div>
      </section>

      <CapsCollection />

      <section className="whatsapp-cta">
        <p className="eyebrow">DISPONIBILIDAD REAL · ATENCIÓN DIRECTA</p>
        <h2>Encuentra una pieza que sí sea tuya.</h2>
        <p>Cuéntanos qué buscas. Te enviamos opciones disponibles, medidas y fotografías reales antes de cualquier reserva.</p>
        <a className="button button--light" href={whatsappUrl} target="_blank" rel="noreferrer">Consultar por WhatsApp <span>↗</span></a>
      </section>

      <footer className="site-footer">
        <div><BrandLogo /><p>Elegancia de raíz.<br />Piezas elegidas una a una.</p></div>
        <div><p className="eyebrow">EXPLORA</p><Link href="/#combinaciones">Abrigos Andinos</Link><Link href="/#gorras">Gorras bordadas</Link><Link href="/#origen">Nuestra raíz</Link></div>
        <div><p className="eyebrow">ATENCIÓN DIRECTA</p><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><span>Envíos en Ecuador</span><Link href="/probador">Vista orientativa</Link><Link href="/admin">Administración</Link></div>
        <p className="footer-bottom">© 2026 KILLAÉ · ELEGANCIA DE RAÍZ · ECUADOR</p>
      </footer>
    </main>
  );
}
