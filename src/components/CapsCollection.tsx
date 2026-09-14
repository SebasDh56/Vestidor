import { WHATSAPP_NUMBER } from "@/src/config/brand";

const CAP_REFERENCES = [
  {
    name: "Colibrí de ciudad",
    imageUrl: "/images/caps/gorra-colibri-negra-editorial-v2.webp",
    imageAlt:
      "Visualización editorial de una modelo con gorra negra KILLAÉ bordada con colibrí y flores",
  },
  {
    name: "Ritmo de los Andes",
    imageUrl: "/images/caps/gorra-raiz-verde-editorial-v2.webp",
    imageAlt:
      "Visualización editorial de un modelo con gorra verde KILLAÉ bordada con figuras andinas",
  },
  {
    name: "El espíritu guía",
    imageUrl: "/images/caps/Ayahuma 3.webp",
    imageAlt:
      "Visualización editorial de una modelo con gorra color tierra KILLAÉ bordada con flores",
  },
] as const;

const CAPS = [
  {
    name: "Aya Huma",
    images: [
      "/images/caps/Ayahuma 1.webp",
      "/images/caps/AyaHuma 2.webp",
      "/images/caps/Ayahuma 3.webp",
    ],
  },
  {
    name: "Chinuca",
    images: [
      "/images/caps/Chinuca 1.webp",
      "/images/caps/Chinuca 2.webp",
      "/images/caps/Chinuca 3.webp",
    ],
  },
  {
    name: "Colibrí",
    images: [
      "/images/caps/Colibri 1.webp",
      "/images/caps/Colibri 2.webp",
      "/images/caps/Colibri 3.webp",
    ],
  },
  {
    name: "Jardín",
    images: [
      "/images/caps/Jardin 1.webp",
      "/images/caps/Jordin 2.webp",
      "/images/caps/Jardin 3.webp",
    ],
  },
  /*{
    name: "Llama",
    images: [
      "/images/caps/Llama 1.webp",
      "/images/caps/Llama 2.webp",
      "/images/caps/Llama 3.webp",
    ],
  },*/
  {
    name: "Mariposa",
    images: [
      "/images/caps/Mariposa 1.webp",
      "/images/caps/Marisopa 2.webp",
      "/images/caps/Mariposa 3.webp",
    ],
  },
 /* {
    name: "Tortuga",
    images: [
      "/images/caps/Tortuga 1.webp",
      "/images/caps/Tortuga 3.webp",
    ],
  },*/
  {
    name: "Tucán",
    images: [
      "/images/caps/Tucan 1.webp",
      "/images/caps/Tucan 2.webp",
      "/images/caps/Tucan 3.webp",
    ],
  },
  /*{
    name: "Raíz Verde",
    images: [
      "/images/caps/Baile 1.png",
      "/images/caps/Baile 2.png",
      "/images/caps/gorra-raiz-verde-editorial-v2.webp",
    ],
  },*/
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

          <h2>
            Otra forma de
            <br />
            llevar <em>tu raíz.</em>
          </h2>
        </div>

        <div className="caps-heading-copy">
          <p>
            Un accesorio que resalta en cualquier lugar: gorras para el sol,
            bordadas con carácter propio y seleccionadas una a una.
          </p>

          <p className="caps-availability-note">
            Los bordados pueden cambiar y no garantizamos que un diseño se
            repita. Por WhatsApp te mostramos las piezas disponibles hoy antes
            de reservar.
          </p>

          <a
            className="button button--light"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver disponibilidad <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <div
        className="caps-gallery"
        aria-label="Visualizaciones editoriales de gorras bordadas KILLAÉ"
      >
        {CAP_REFERENCES.map((reference, index) => (
          <figure
            className={
              index === 0
                ? "caps-card caps-card--featured"
                : "caps-card"
            }
            key={reference.name}
          >
            <img
              src={reference.imageUrl}
              alt={reference.imageAlt}
              loading="lazy"
            />

            <figcaption>
              <strong>{reference.name}</strong>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="caps-editorial-note">
        Las imágenes editoriales muestran cómo puede lucir la gorra puesta.
        Antes de reservar te enseñamos fotografías de las piezas disponibles.
      </p>

      <div className="caps-real-section">
        <div className="caps-real-heading">
          <p className="eyebrow">MODELOS</p>
          <h3>Explora los diseños</h3>
          <p>
            Desliza para descubrir la colección. Pasa el cursor sobre cada
            gorra para ver sus diferentes ángulos.
          </p>
        </div>

        <div className="caps-slider">
          {CAPS.map((cap) => (
            <article className="cap-product-card" key={cap.name}>
              <div className="cap-product-images">
                {cap.images.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={`${cap.name} `}
                    loading="lazy"
                    className={`cap-product-image cap-product-image`}
                  />
                ))}
              </div>

              <div className="cap-product-info">
                <strong>{cap.name}</strong>
                
              </div>
            </article>
          ))}
        </div>
      </div>

      <div
        className="caps-trust-row"
        aria-label="Características de la línea de gorras"
      >
        <span>Bordado artesanal</span>
        <span>Diseños variables</span>
        <span>Foto real antes de reservar</span>
      </div>
    </section>
  );
}