import Link from "next/link";
import { BrandLogo } from "@/src/components/BrandLogo";
import {
  getAdminUser,
  isAdminAuthConfigured,
} from "@/app/admin-auth";
import { AdminGarmentForm } from "@/src/components/AdminGarmentForm";
import { AdminAvailabilityControl } from "@/src/components/AdminAvailabilityControl";
import { ADMIN_EMAIL, BRAND_NAME, WHATSAPP_NUMBER } from "@/src/config/brand";
import { ensureAdminMembership, listGarments } from "@/src/services/catalog";
import { listCustomerRequests } from "@/src/services/requests";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await getAdminUser();
  if (!user) {
    const { error } = await searchParams;
    const authConfigured = isAdminAuthConfigured();
    return (
      <main className="admin-login">
        <BrandLogo compact />
        <section>
          <p className="eyebrow">ACCESO RESTRINGIDO</p>
          <h1>Administración<br />de piezas únicas.</h1>
          <p>Publica nuevos abrigos, carga su imagen y controla si cada pieza está disponible, reservada o vendida.</p>
          <form className="admin-login-form" action="/api/admin/login" method="post">
            <input type="hidden" name="returnTo" value="/admin" />
            <label>
              Correo administrativo
              <input name="email" type="email" defaultValue={ADMIN_EMAIL} autoComplete="username" required />
            </label>
            <label>
              Contraseña
              <input name="password" type="password" autoComplete="current-password" minLength={8} required />
            </label>
            {error === "credentials" && <p className="admin-login-error">Correo o contraseña incorrectos.</p>}
            {(error === "configuration" || !authConfigured) && <p className="admin-login-error">Falta configurar el secreto ADMIN_PASSWORD en Cloudflare.</p>}
            <button className="button button--dark" type="submit" disabled={!authConfigured}>Entrar al panel</button>
          </form>
          <small className="admin-login-hint">Sesión privada protegida por una cookie firmada. La contraseña nunca se guarda en el navegador.</small>
        </section>
      </main>
    );
  }

  const access = await ensureAdminMembership(user);
  if (!access.allowed) return <main className="admin-denied"><h1>Acceso no autorizado</h1><p>Este panel pertenece al administrador registrado.</p><Link href="/">Volver al inicio</Link></main>;

  const [garments, requests] = await Promise.all([listGarments(), listCustomerRequests()]);
  const available = garments.filter((item) => item.availability === "available").length;

  return (
    <main className="admin-page">
      <header className="admin-header"><BrandLogo compact /><div><span>{user.email}</span><form action="/api/admin/logout" method="post"><button type="submit">Cerrar sesión</button></form></div></header>
      <section className="admin-shell">
        <aside>
          <p className="eyebrow">PANEL KILLAÉ</p>
          <h1>{available}<br />disponibles.</h1>
          <p>Administra cada prenda como una pieza individual. Cambia su estado inmediatamente cuando se reserve o se venda.</p>
          <div className="admin-notice">Este MVP registra catálogo y solicitudes. Los pagos se coordinan fuera de la página.</div>
        </aside>
        <div className="admin-main">
          <section className="admin-form-card"><div><p className="eyebrow">NUEVA PIEZA</p><h2>Publicar un abrigo irrepetible</h2></div><AdminGarmentForm /></section>
          <section className="admin-requests">
            <div className="section-heading"><div><p className="eyebrow">CONTACTOS RECIBIDOS</p><h2>{requests.length} solicitudes</h2></div></div>
            <div className="request-table">
              {requests.length === 0 && <div className="empty-admin">Las consultas enviadas desde las fichas aparecerán aquí.</div>}
              {requests.map((item) => {
                const text = encodeURIComponent(`Hola ${item.customerName}, te contactamos de ${BRAND_NAME} por tu interés en ${item.garmentName}, color ${item.color}, talla habitual ${item.size}.`);
                return <article className="request-row" key={item.id}><time>{new Date(item.createdAt).toLocaleDateString("es-EC")}</time><div><strong>{item.customerName}</strong><small>{item.customerPhone}{item.city ? ` · ${item.city}` : ""}</small></div><p>{item.garmentName}<br />{item.color} · {item.size}{item.notes ? <><br />{item.notes}</> : null}</p><a href={`https://wa.me/${item.customerPhone.replace(/\D/g, "") || WHATSAPP_NUMBER}?text=${text}`}>Responder</a></article>;
              })}
            </div>
          </section>
          <section className="admin-list">
            <div className="section-heading"><div><p className="eyebrow">CATÁLOGO ACTUAL</p><h2>{garments.length} piezas</h2></div></div>
            <div>{garments.map((garment) => <article key={garment.slug}><img src={garment.imageUrl} alt="" className={`focus-${garment.imageFocus}`} /><div><strong>{garment.pieceCode} · {garment.name}</strong><span>{garment.color} · {garment.units} unidad</span></div><AdminAvailabilityControl slug={garment.slug} value={garment.availability} /><Link href={`/producto/${garment.slug}`}>Ver ↗</Link></article>)}</div>
          </section>
        </div>
      </section>
    </main>
  );
}
