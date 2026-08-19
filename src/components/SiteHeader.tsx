"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { BrandLogo } from "@/src/components/BrandLogo";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const closeMobileMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.closest("details")?.removeAttribute("open");
  };

  return (
    <header className={`site-header ${overlay ? "site-header--overlay" : ""}`}>
      <BrandLogo />
      <nav className="desktop-nav" aria-label="Navegación principal">
        <Link href="/">Inicio</Link>
        <Link href="/#combinaciones">Abrigos</Link>
        <Link href="/#gorras">Gorras</Link>
        <Link href="/#origen">Nuestra raíz</Link>
        <Link className="nav-tryon" href="/probador">Vista orientativa</Link>
      </nav>
      <details className="mobile-menu">
        <summary aria-label="Abrir menú"><span /><span /></summary>
        <nav aria-label="Navegación móvil">
          <Link href="/" onClick={closeMobileMenu}>Inicio</Link>
          <Link href="/#combinaciones" onClick={closeMobileMenu}>Abrigos</Link>
          <Link href="/#gorras" onClick={closeMobileMenu}>Gorras</Link>
          <Link href="/#origen" onClick={closeMobileMenu}>Nuestra raíz</Link>
          <Link href="/probador" onClick={closeMobileMenu}>Vista orientativa</Link>
        </nav>
      </details>
    </header>
  );
}
