import {
  isLocalDevelopmentRequest,
  LOCAL_ADMIN_COOKIE,
} from "@/app/chatgpt-auth";
import { ADMIN_EMAIL } from "@/src/config/brand";

export async function POST() {
  if (!(await isLocalDevelopmentRequest())) {
    return Response.json({ error: "Ruta no disponible." }, { status: 404 });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin",
      "Set-Cookie": `${LOCAL_ADMIN_COOKIE}=${ADMIN_EMAIL}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
    },
  });
}
