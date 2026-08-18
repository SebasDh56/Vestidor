import { clearAdminSessionCookie } from "@/app/admin-auth";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/",
      "Set-Cookie": clearAdminSessionCookie(requestUrl.protocol === "https:"),
    },
  });
}
