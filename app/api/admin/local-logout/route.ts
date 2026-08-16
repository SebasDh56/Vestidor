import {
  isLocalDevelopmentRequest,
  LOCAL_ADMIN_COOKIE,
} from "@/app/chatgpt-auth";

export async function GET() {
  if (!(await isLocalDevelopmentRequest())) {
    return Response.json({ error: "Ruta no disponible." }, { status: 404 });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin",
      "Set-Cookie": `${LOCAL_ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
