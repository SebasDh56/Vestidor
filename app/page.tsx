import Link from "next/link";
import { ProductCard } from "@/src/components/ProductCard";
import { SiteHeader } from "@/src/components/SiteHeader";
import { listGarments } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const garments = await listGarments();
  return (
    <main>
      <section className="hero">
        <SiteHeader overlay />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="hero-kicker">DISEÑO ECUATORIANO · EDICIÓN LIMITADA</p>
          <h1>Raíces que<br /><em>se visten.</em></h1>
          <p className="hero-description">Prendas contemporáneas con detalles que cuentan de dónde venimos.</p>
          <div className="hero-actions">
            <Link className="button button--light" href="/catalogo">Explorar colección</Link>
            <Link className="text-link text-link--light" href="/probador">Probar con mi cámara <span>↗</span></Link>
          </div>
        </div>
        <div className="hero-side-note"><span>01</span><p>Hecho a pequeña escala<br />con identidad local</p></div>
        <a href="#coleccion" className="scroll-cue">DESLIZA <span>↓</span></a>
      </section>

      <section className="intro" id="origen">
        <p className="eyebrow">NUESTRO MANIFIESTO</p>
        <div>
          <h2>Vestir el presente<br />sin olvidar el <em>origen.</em></h2>
          <div className="intro-copy">
            <p>Creamos una vitrina digital para prendas con carácter: cortes limpios, texturas táctiles y acentos artesanales que merecen verse de cerca.</p>
            <Link className="text-link" href="/catalogo">Conocer la colección <span>→</span></Link>
          </div>
        </div>
      </section>

      <section className="collection-section" id="coleccion">
        <div className="section-heading">
          <div><p className="eyebrow">COLECCIÓN 01</p><h2>Piezas con historia</h2></div>
          <p>Una selección breve, sin ruido y sin producción masiva.</p>
        </div>
        <div className="product-grid">
          {garments.slice(0, 4).map((garment, index) => <ProductCard key={garment.slug} garment={garment} index={index} />)}
        </div>
        <div className="center-action"><Link className="button button--outline" href="/catalogo">Ver todas las prendas</Link></div>
      </section>

      <section className="editorial-block">
        <div className="editorial-image"><img src="/images/editorial/lookbook-sisa-ai.png" alt="Abrigo Sisa Rosa en un entorno andino" /></div>
        <div className="editorial-copy">
          <p className="eyebrow">DETALLE QUE PERMANECE</p>
          <h2>Flores que<br /><em>hablan.</em></h2>
          <p>El bordado aporta una voz única a cada silueta. La tecnología nos ayuda a acercarla; la identidad sigue siendo humana.</p>
          <Link className="text-link" href={`/producto/${garments[3]?.slug ?? garments[0].slug}`}>Descubrir la pieza <span>→</span></Link>
          <span className="editorial-number">02</span>
        </div>
      </section>

      <section className="tryon-promo">
        <div className="tryon-orbit"><span>IA</span></div>
        <p className="eyebrow">NUEVA EXPERIENCIA</p>
        <h2>¿Y si pudieras verla<br /><em>sobre ti?</em></h2>
        <p>Activa tu cámara, compara tallas y observa cómo la prenda acompaña el movimiento de tus hombros y brazos.</p>
        <Link className="button button--warm" href="/probador">Abrir probador virtual <span>↗</span></Link>
        <div className="privacy-chip">TU VIDEO NO SE GUARDA</div>
      </section>

      <footer className="site-footer">
        <div><span className="brand-mark">R</span><strong>RAÍZ</strong><p>Diseño con memoria.<br />Tecnología con propósito.</p></div>
        <div><p className="eyebrow">EXPLORA</p><Link href="/catalogo">Colección</Link><Link href="/probador">Probador IA</Link><Link href="/#origen">Nuestro origen</Link></div>
        <div><p className="eyebrow">INFORMACIÓN</p><span>Procesamiento privado</span><span>Guía de tallas orientativa</span><Link href="/admin">Administración</Link></div>
        <p className="footer-bottom">© 2026 RAÍZ · PROTOTIPO FUNCIONAL</p>
      </footer>
    </main>
  );
}
