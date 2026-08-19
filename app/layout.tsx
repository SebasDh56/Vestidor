import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "KILLAÉ · Abrigo Andino por talla y combinación";
  const description = "Conoce las 13 combinaciones reales de color y diseño del Abrigo Andino KILLAÉ, organizadas por talla para niñas, S, M y L.";
  return {
    metadataBase,
    title,
    description,
    openGraph: { title, description, type: "website", images: ["/og-killae-drop01.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-killae-drop01.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
