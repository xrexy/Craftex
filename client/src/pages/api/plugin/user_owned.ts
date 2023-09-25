import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";

import db from "$server/db";
import { plugin } from "$server/db/schema";
import { response } from "$lib/helpers/response";

export const GET: APIRoute = async ({ locals, redirect, request }) => {
  const session = await locals.auth.validate();
  if (!session) return response.error("Unauthorized", 401);

  return response.success(
    await db
      .select()
      .from(plugin)
      .where(eq(plugin.publisherId, session.user.userId))
  );
};

