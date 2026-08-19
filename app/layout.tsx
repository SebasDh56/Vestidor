import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "KILLAÉ · Piezas artesanales con raíz ecuatoriana";
  const description = "Descubre abrigos andinos y gorras bordadas seleccionadas una a una, elaboradas con manos locales y disponibles por consulta directa en Ecuador.";
  return {
    metadataBase,
    title,
    description,
    icons: {
      icon: [{ url: "/favicon.png", type: "image/png" }],
      apple: "/apple-icon.png",
    },
    openGraph: { title, description, type: "website", images: ["/og-killae-drop01.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-killae-drop01.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
