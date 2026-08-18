import {
  authenticateAdmin,
  createAdminSessionCookie,
  isAdminAuthConfigured,
  safeAdminReturnPath,
} from "@/app/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const returnTo = safeAdminReturnPath(String(form.get("returnTo") ?? "/admin"));
  const requestUrl = new URL(request.url);

  if (!isAdminAuthConfigured()) {
    return Response.redirect(new URL("/admin?error=configuration", requestUrl), 303);
  }
  if (!(await authenticateAdmin(email, password))) {
    return Response.redirect(new URL("/admin?error=credentials", requestUrl), 303);
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: returnTo,
      "Set-Cookie": await createAdminSessionCookie(requestUrl.protocol === "https:"),
    },
  });
}
