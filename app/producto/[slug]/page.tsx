import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/SiteHeader";
import { getGarmentBySlug } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const garment = await getGarmentBySlug(slug);
  if (!garment) notFound();

  const isKilla = garment.slug === "chaqueta-killa-marfil";
  const gallery = isKilla
    ? [
        { src: garment.imageUrl, alt: `${garment.name}, vista frontal`, label: "Vista frontal" },
        { src: "/images/products/chaqueta-killa-modelo.png", alt: `${garment.name} puesta`, label: "Así luce puesta" },
        { src: "/images/products/chaqueta-killa-tallas.png", alt: `Tabla de tallas de ${garment.name}`, label: "Medidas de la prenda" },
      ]
    : [{ src: garment.imageUrl, alt: garment.name, label: "Vista de referencia" }];

  return (
    <main className="inner-page product-page">
      <SiteHeader />
      <section className="product-detail">
        <div className={`product-detail-image${isKilla ? " product-gallery" : ""}`}>
          {gallery.map((image, index) => (
            <figure className={index === 0 ? "product-gallery-primary" : ""} key={image.src}>
              <img src={image.src} alt={image.alt} className={`focus-${garment.imageFocus}`} />
              <figcaption>{image.label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{garment.category}</p>
          <h1>{garment.name}</h1>
          <p className="product-lead">{garment.description}</p>
          <dl><div><dt>Color</dt><dd>{garment.color}</dd></div><div><dt>Material</dt><dd>{garment.material}</dd></div><div><dt>Disponibilidad</dt><dd>Pieza de exhibición</dd></div></dl>
          <div className="product-sizes"><span>Tallas configuradas</span><div>{garment.sizes.map((size) => <span key={size}>{size}</span>)}</div></div>
          {isKilla && (
            <div className="size-measurements" aria-label="Medidas de la prenda en centímetros">
              <div><span>Talla</span><span>Largo</span><span>Ancho</span><span>Mangas</span><span>Hombros</span></div>
              <div><b>S</b><span>58</span><span>50</span><span>55</span><span>43</span></div>
              <div><b>M</b><span>60</span><span>52</span><span>58</span><span>45</span></div>
              <div><b>L</b><span>64</span><span>54</span><span>63</span><span>47</span></div>
              <small>Todas las medidas están expresadas en cm.</small>
            </div>
          )}
          <Link className="button button--dark button--full" href={`/probador?prenda=${garment.slug}`}>Probar con mi cámara <span>↗</span></Link>
          <p className="privacy-note">La cámara se procesa de forma temporal en tu navegador.</p>
        </div>
      </section>
    </main>
  );
}
