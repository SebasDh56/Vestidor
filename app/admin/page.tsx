import Link from "next/link";
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "@/app/chatgpt-auth";
import { AdminGarmentForm } from "@/src/components/AdminGarmentForm";
import { ensureAdminMembership, listGarments } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) {
    return (
      <main className="admin-login">
        <Link className="brand brand--dark" href="/"><span className="brand-mark">R</span><span>RAÍZ</span></Link>
        <section><p className="eyebrow">ACCESO RESTRINGIDO</p><h1>Administración<br />de la colección.</h1><p>Inicia sesión para publicar información e imágenes de nuevas prendas. Los visitantes del catálogo no necesitan cuenta.</p><Link className="button button--dark" href={chatGPTSignInPath("/admin")}>Iniciar sesión como admin</Link></section>
      </main>
    );
  }

  const access = await ensureAdminMembership(user);
  if (!access.allowed) {
    return <main className="admin-denied"><h1>Acceso no autorizado</h1><p>Este panel pertenece al administrador registrado.</p><Link href={chatGPTSignOutPath("/")}>Cerrar sesión</Link></main>;
  }

  const garments = await listGarments();
  return (
    <main className="admin-page">
      <header className="admin-header"><Link className="brand brand--dark" href="/"><span className="brand-mark">R</span><span>RAÍZ</span></Link><div><span>{user.email}</span><Link href={chatGPTSignOutPath("/")}>Cerrar sesión</Link></div></header>
      <section className="admin-shell">
        <aside><p className="eyebrow">PANEL DE COLECCIÓN</p><h1>Hola,<br />administración.</h1><p>Este prototipo gestiona información, imágenes y configuración visual. No incluye stock, pedidos ni pagos.</p>{access.bootstrapped && <div className="admin-notice">Tu cuenta quedó registrada como el administrador inicial.</div>}</aside>
        <div className="admin-main">
          <section className="admin-form-card"><div><p className="eyebrow">NUEVA PRENDA</p><h2>Publicar en el catálogo</h2></div><AdminGarmentForm /></section>
          <section className="admin-list"><div className="section-heading"><div><p className="eyebrow">CATÁLOGO ACTUAL</p><h2>{garments.length} prendas</h2></div></div><div>{garments.map((garment) => <article key={garment.slug}><img src={garment.imageUrl} alt="" className={`focus-${garment.imageFocus}`} /><div><strong>{garment.name}</strong><span>{garment.category} · {garment.color}</span></div><Link href={`/producto/${garment.slug}`}>Ver ↗</Link></article>)}</div></section>
        </div>
      </section>
    </main>
  );
}
