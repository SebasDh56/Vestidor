import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/src/config/brand";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={`brand-logo${compact ? " brand-logo--compact" : ""}`}
      href="/"
      aria-label={`${BRAND_NAME}, inicio`}
    >
      <img
        className="brand-emblem-image"
        src="/brand/killae-emblem.png"
        alt=""
        width={40}
        height={40}
        aria-hidden="true"
      />
      <span className="brand-wordmark">
        <strong>{BRAND_NAME}</strong>
        <small>{BRAND_TAGLINE}</small>
      </span>
    </Link>
  );
}
