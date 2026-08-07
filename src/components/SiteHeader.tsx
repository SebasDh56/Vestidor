import Link from "next/link";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`site-header ${overlay ? "site-header--overlay" : ""}`}>
      <Link className="brand" href="/" aria-label="Raíz, inicio">
        <span className="brand-mark">R</span>
        <span>RAÍZ</span>
      </Link>
      <nav className="desktop-nav" aria-label="Navegación principal">
        <Link href="/">Inicio</Link>
        <Link href="/catalogo">Colección</Link>
        <Link href="/#origen">Nuestro origen</Link>
        <Link className="nav-tryon" href="/probador">Probador IA</Link>
      </nav>
      <details className="mobile-menu">
        <summary aria-label="Abrir menú"><span /><span /></summary>
        <nav aria-label="Navegación móvil">
          <Link href="/">Inicio</Link>
          <Link href="/catalogo">Colección</Link>
          <Link href="/#origen">Nuestro origen</Link>
          <Link href="/probador">Probador IA</Link>
        </nav>
      </details>
    </header>
  );
}
