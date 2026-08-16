import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureAdminMembership } from "@/src/services/catalog";
import { createCustomerRequest, listCustomerRequests } from "@/src/services/requests";

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const input = {
      garmentSlug: clean(body.garmentSlug, 100),
      garmentName: clean(body.garmentName, 120),
      color: clean(body.color, 40),
      size: clean(body.size, 8),
      customerName: clean(body.customerName, 100),
      customerPhone: clean(body.customerPhone, 30),
      city: clean(body.city, 80),
      notes: clean(body.notes, 500),
    };
    if (!input.garmentSlug || !input.garmentName || !input.color || !input.size || !input.customerName || !input.customerPhone) {
      return Response.json({ error: "Completa nombre, WhatsApp, modelo, color y talla." }, { status: 400 });
    }
    const result = await createCustomerRequest(input);
    return Response.json(result, { status: 201 });
  } catch {
    return Response.json({ error: "No se pudo registrar la solicitud." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });
  const membership = await ensureAdminMembership(user);
  if (!membership.allowed) return Response.json({ error: "No autorizado." }, { status: 403 });
  return Response.json({ requests: await listCustomerRequests() });
}
