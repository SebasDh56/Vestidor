import Link from "next/link";
import { BrandLogo } from "@/src/components/BrandLogo";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`site-header ${overlay ? "site-header--overlay" : ""}`}>
      <BrandLogo />
      <nav className="desktop-nav" aria-label="Navegación principal">
        <Link href="/">Inicio</Link>
        <Link href="/catalogo">Combinaciones</Link>
        <Link href="/#origen">Nuestra raíz</Link>
        <Link className="nav-tryon" href="/probador">Vista orientativa</Link>
      </nav>
      <details className="mobile-menu">
        <summary aria-label="Abrir menú"><span /><span /></summary>
        <nav aria-label="Navegación móvil">
          <Link href="/">Inicio</Link>
          <Link href="/catalogo">Combinaciones</Link>
          <Link href="/#origen">Nuestra raíz</Link>
          <Link href="/probador">Vista orientativa</Link>
        </nav>
      </details>
    </header>
  );
}
