import Link from "next/link";
import { BrandLogo } from "@/src/components/BrandLogo";
import { CapsCollection } from "@/src/components/CapsCollection";
import { CombinationCollection } from "@/src/components/CombinationCollection";
import { SiteHeader } from "@/src/components/SiteHeader";
import { WHATSAPP_NUMBER } from "@/src/config/brand";
import { COMBINATION_COUNT } from "@/src/data/combinations";

export const dynamic = "force-dynamic";

export default function Home() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola KILLAÉ, quiero conocer las piezas disponibles en mi talla y recibir fotografías reales antes de reservar."
  )}`;

  return (
    <main>
      {/* HERO */}
      <section className="unique-hero">
        <SiteHeader />

        <div className="unique-hero-copy">
          <p className="hero-kicker">
            DISEÑOS QUE NO PASAN DESAPERCIBIDOS · ECUADOR
          </p>

          <h1>
            Hay abrigos que combinan
            <br />
            con tu look.
            <br />
            <em>Este cambia tu look.</em>
          </h1>

          <p className="hero-description">
            Elige tu talla y descubre combinaciones de color y detalles
            textiles pensadas para darle personalidad incluso al outfit más
            sencillo. Mira la pieza real antes de reservar y elige exactamente
            la que quieres llevar.
          </p>

          <div className="hero-actions">
            <Link
              className="button button--dark"
              href="/#combinaciones"
            >
              Ver mi talla
            </Link>

            <Link
              className="text-link"
              href="/#combinaciones"
            >
              Ver las {COMBINATION_COUNT} combinaciones <span>→</span>
            </Link>
          </div>

          <div className="hero-microfacts">
            <span>
              <strong>{COMBINATION_COUNT}</strong> combinaciones
            </span>

            <span>
              <strong>Niñas · S · M · L</strong>
            </span>

            <span>
              <strong>Foto real</strong> antes de reservar
            </span>
          </div>
        </div>

        <Link
          className="unique-hero-visual"
          href="/catalogo"
        >
          <img
            src="/images/models/abrigo-andino-talla-s-combinacion-04-v6.webp"
            alt="Tierra Serena, Abrigo Andino abierto KILLAÉ en talla S con tres botones forrados"
          />

          <div className="hero-piece-label">
            <span>
              ABRIGO ANDINO · COMBINACIÓN 04 · TALLA S
            </span>

            <strong>¿Te imaginas tu próximo look con este?</strong>

            <small>Quiero verlo →</small>
          </div>
        </Link>
      </section>

      {/* PROMESAS */}
      <section
        className="brand-promises"
        aria-label="Principios de KILLAÉ"
      >
        <span>Combinaciones con personalidad</span>
        <span>Disponibilidad real</span>
        <span>Foto real antes de reservar</span>
        <span>Atención directa por WhatsApp</span>
      </section>

      {/* IDENTIDAD */}
      <section
        className="unique-intro"
        id="origen"
      >
        <p className="eyebrow">
          KILLAÉ · DISEÑO CON IDENTIDAD
        </p>

        <div>
          <h2>
            Hecho para vestir diferente.
            <br />
            <em>No para vestir igual.</em>
          </h2>

          <div className="intro-copy">
            <p>
              En KILLAÉ elegimos combinaciones que tengan algo que decir:
              colores, paños y detalles textiles que convierten cada abrigo
              en la pieza protagonista del look.
            </p>

            <p className="intro-note">
              Trabajamos cerca de quienes confeccionan y bordan en Ecuador.
              Antes de que reserves, confirmamos medidas, disponibilidad y te
              mostramos fotografías de la pieza real.
            </p>

            <a
              className="text-link"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver qué hay disponible <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* COMBINACIONES */}
      <CombinationCollection />

      {/* PROCESO DE COMPRA */}
      <section className="drop-process">
        <div className="choice-heading">
          <p className="eyebrow">
            ENCONTRAR EL TUYO ES FÁCIL
          </p>

          <h2>
            Lo ves.
            <br />
            <em>Lo eliges.</em>
            <br />
            Lo reservas.
          </h2>
        </div>

        <ol>
          <li>
            <span>01</span>

            <div>
              <h3>Encuentra tu talla</h3>

              <p>
                Elige Niñas, S, M o L y mira las combinaciones preparadas
                para esa medida.
              </p>
            </div>
          </li>

          <li>
            <span>02</span>

            <div>
              <h3>Elige tu favorita</h3>

              <p>
                Cada combinación tiene su propio código, colores y detalles
                para que puedas pedir exactamente la que viste.
              </p>
            </div>
          </li>

          <li>
            <span>03</span>

            <div>
              <h3>Escríbenos por WhatsApp</h3>

              <p>
                Dinos el código que te gustó y confirmamos disponibilidad,
                medidas y opciones de entrega.
              </p>
            </div>
          </li>

          <li>
            <span>04</span>

            <div>
              <h3>Mira la pieza real</h3>

              <p>
                Antes de reservar te mostramos fotografías reales de la
                prenda disponible para que sepas exactamente qué estás
                eligiendo.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* BLOQUE EDITORIAL / CONFIANZA */}
      <section className="editorial-block editorial-block--unique">
        <div className="editorial-image">
          <img
            src="/images/models/abrigo-andino-talla-m-combinacion-08-v6.webp"
            alt="Noche Andina, Abrigo Andino abierto KILLAÉ en talla M con tres botones forrados"
          />
        </div>

        <div className="editorial-copy">
          <p className="eyebrow">
            COMPRA CON MÁS SEGURIDAD
          </p>

          <h2>
            La foto bonita te enamora.
            <br />
            <em>La foto real te ayuda a decidir.</em>
          </h2>

          <p>
            Las imágenes editoriales te muestran cómo puede lucir el Abrigo
            Andino puesto. Antes de reservar te enseñamos fotografías reales
            de la pieza disponible, confirmamos sus medidas y resolvemos tus
            dudas directamente.
          </p>

          <Link
            className="text-link"
            href="/#combinaciones"
          >
            Comparar combinaciones <span>→</span>
          </Link>

          <span className="editorial-number">
            01–{COMBINATION_COUNT}
          </span>
        </div>
      </section>

      {/* GORRAS */}
      <CapsCollection />

      {/* CTA WHATSAPP */}
      <section className="whatsapp-cta">
        <p className="eyebrow">
          YA VISTE LAS COMBINACIONES · AHORA FALTA LA TUYA
        </p>

        <h2>
          ¿Cuál usarías tú?
        </h2>

        <p>
          Dinos tu talla o mándanos el código de la combinación que te gustó.
          Te mostramos disponibilidad, medidas y fotografías reales antes de
          reservar.
        </p>

        <a
          className="button button--light"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          Quiero ver mi talla <span>↗</span>
        </a>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
<<<<<<< HEAD
        <div>
          <BrandLogo />

          <p>
            Diseño con identidad.
            <br />
            Encuentra la combinación que va contigo.
          </p>
        </div>

        <div>
          <p className="eyebrow">EXPLORA</p>

          <Link href="/#combinaciones">
            Abrigos Andinos
          </Link>

          <Link href="/#gorras">
            Gorras bordadas
          </Link>

          <Link href="/#origen">
            Nuestra historia
          </Link>
        </div>

        <div>
          <p className="eyebrow">
            COMPRA DIRECTA
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>

          <span>
            Envíos en Ecuador
          </span>

          <Link href="/probador">
            Pruébatelo
          </Link>

          <Link href="/admin">
            Administración
          </Link>
        </div>

        <p className="footer-bottom">
          © 2026 KILLAÉ · ELEGANCIA DE RAÍZ · ECUADOR
        </p>
=======
        <div><BrandLogo /><p>Elegancia de raíz.<br />Tu talla, tu combinación.</p></div>
        <div><p className="eyebrow">EXPLORA</p><Link href="/catalogo">Combinaciones</Link><Link href="/probador">Vista orientativa</Link><Link href="/#origen">Nuestra raíz</Link></div>
        <div><p className="eyebrow">COMPRA DIRECTA</p><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><span>Envíos en Ecuador</span><Link href="/admin">Administración</Link></div>
        <p className="footer-bottom">© 2026 KILLAÉ · ELEGANCIA DE RAÍZ · ECUADOR</p>
>>>>>>> e8881bfa7ddfd6ef930a16a631cab0bb3892a872
      </footer>
    </main>
  );
}