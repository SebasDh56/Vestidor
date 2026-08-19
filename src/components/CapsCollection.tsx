import { WHATSAPP_NUMBER } from "@/src/config/brand";

const CAP_REFERENCES = [
  {
    name: "Colibrí de ciudad",
    imageUrl: "/images/caps/gorra-colibri-negra-editorial-v2.webp",
    imageAlt: "Visualización editorial de una modelo con gorra negra KILLAÉ bordada con colibrí y flores",
  },
  {
    name: "Ritmo de los Andes",
    imageUrl: "/images/caps/gorra-raiz-verde-editorial-v2.webp",
    imageAlt: "Visualización editorial de un modelo con gorra verde KILLAÉ bordada con figuras andinas",
  },
  {
    name: "Jardín de altura",
    imageUrl: "/images/caps/gorra-flores-tierra-editorial-v2.webp",
    imageAlt: "Visualización editorial de una modelo con gorra color tierra KILLAÉ bordada con flores",
  },
] as const;

export function CapsCollection() {
  const message = encodeURIComponent(
    "Hola KILLAÉ, quiero conocer las gorras bordadas disponibles hoy. ¿Pueden enviarme fotografías reales de los diseños actuales?",
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <section className="caps-collection" id="gorras">
      <header className="caps-heading">
        <div>
          <p className="eyebrow">LÍNEA SOL · GORRAS BORDADAS</p>
          <h2>Otra forma de<br />llevar <em>tu raíz.</em></h2>
        </div>
        <div className="caps-heading-copy">
          <p>
            Una línea independiente del Abrigo Andino: gorras para el sol, bordadas con carácter propio
            y seleccionadas una a una.
          </p>
          <p className="caps-availability-note">
            Los bordados pueden cambiar y no garantizamos que un diseño se repita. Por WhatsApp te mostramos
            las piezas disponibles hoy antes de reservar.
          </p>
          <a className="button button--light" href={whatsappUrl} target="_blank" rel="noreferrer">
            Ver disponibilidad <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <div className="caps-gallery" aria-label="Visualizaciones editoriales de gorras bordadas KILLAÉ">
        {CAP_REFERENCES.map((reference, index) => (
          <figure className={index === 0 ? "caps-card caps-card--featured" : "caps-card"} key={reference.name}>
            <img src={reference.imageUrl} alt={reference.imageAlt} loading="lazy" />
            <figcaption>
              <span>Visualización editorial con IA · {String(index + 1).padStart(2, "0")}</span>
              <strong>{reference.name}</strong>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="caps-editorial-note">
        Las escenas y modelos son visualizaciones editoriales con IA para mostrar posibles formas de uso.
        Antes de reservar, te enviamos por WhatsApp fotografías reales de la gorra disponible.
      </p>

      <div className="caps-trust-row" aria-label="Características de la línea de gorras">
        <span>Bordado artesanal</span>
        <span>Diseños variables</span>
        <span>Foto real antes de reservar</span>
      </div>
    </section>
  );
}
