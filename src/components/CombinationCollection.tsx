import { WHATSAPP_NUMBER } from "@/src/config/brand";
import { COMBINATION_COUNT, COMBINATION_SIZE_GROUPS } from "@/src/data/combinations";

export function CombinationCollection({ catalog = false }: { catalog?: boolean }) {
  return (
    <section
      className={`combination-collection${catalog ? " combination-collection--catalog" : ""}`}
      id="combinaciones"
    >
      <header className="combination-heading">
        <div>
          <p className="eyebrow">ABRIGO ANDINO · {COMBINATION_COUNT} COMBINACIONES REALES</p>
          <h2>Conoce los colores<br />y diseños <em>por talla.</em></h2>
        </div>
        <div className="combination-heading-copy">
          <p>Una misma silueta, distintas expresiones textiles. Empieza por tu talla y elige el código que más se parece a ti.</p>
          <span>Disponibles ahora: Niñas · S · M</span>
        </div>
      </header>

      <div className="combination-grid">
        {COMBINATION_SIZE_GROUPS.map((group) => (
          <article className="combination-group" key={group.id}>
            <div className="combination-group-title">
              <div><span>{group.audience}</span><h3>{group.sizeLabel}</h3></div>
              <strong>{group.range}</strong>
            </div>
            <figure className="combination-board">
              <img src={group.imageUrl} alt={group.imageAlt} loading={group.id === "ninas" ? "eager" : "lazy"} />
            </figure>
            <div className="combination-options" aria-label={`Opciones ${group.sizeLabel}`}>
              {group.combinations.map((combination) => {
                const message = encodeURIComponent(
                  `Hola KILLAÉ, me interesa la combinación ${combination.code} (${combination.name}) del Abrigo Andino, ${group.sizeLabel}. Quiero confirmar disponibilidad y medidas.`,
                );
                return (
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
                    target="_blank"
                    rel="noreferrer"
                    key={combination.code}
                  >
                    <span className="combination-code">{combination.code}</span>
                    <span className="combination-swatches" aria-hidden="true">
                      <i style={{ background: combination.baseColor }} />
                      <i style={{ background: combination.accentColor }} />
                    </span>
                    <span className="combination-option-copy">
                      <strong>{combination.name}</strong>
                      <small>{combination.palette}</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </a>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <aside className="combination-upcoming">
        <span>PRÓXIMA TALLA</span>
        <strong>L</strong>
        <p>Nuevas combinaciones se sumarán a la familia Abrigo Andino.</p>
      </aside>
    </section>
  );
}
