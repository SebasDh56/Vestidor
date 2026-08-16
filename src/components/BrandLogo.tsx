import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/src/config/brand";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={`brand-logo${compact ? " brand-logo--compact" : ""}`}
      href="/"
      aria-label={`${BRAND_NAME}, inicio`}
    >
      <span className="brand-emblem" aria-hidden="true"><span /></span>
      <span className="brand-wordmark">
        <strong>{BRAND_NAME}</strong>
        <small>{BRAND_TAGLINE}</small>
      </span>
    </Link>
  );
}
