import type { APIRoute } from "astro";
import { auth } from "$lib/lucia";
import { response } from "$lib/helpers/response";

export const POST: APIRoute = async ({ locals, redirect, params }) => {
  const session = await locals.auth.validate();
  if (!session) return response.error("Unauthorized", 401);

  await auth.invalidateSession(session.sessionId);

  locals.auth.setSession(null);

  const noRedirect = (params?.noRedirect ?? "false") == "true";
  return noRedirect ? response.success() : redirect("/auth/login", 302);
};
