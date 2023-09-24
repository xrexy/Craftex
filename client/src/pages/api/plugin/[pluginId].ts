import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";

import db from "$server/db";
import { plugin } from "$server/db/schema";

import { response } from "$lib/helpers/response";
import { cuid2Schema } from "$lib/validation";

export let GET: APIRoute = async ({ params, locals }) => {
  if (!params.pluginId) return response.error("Missing pluginId", 400);

  const pluginId = cuid2Schema.safeParse(params.pluginId);
  if (!pluginId.success)
    return response.error("Invalid plugin id provided", 400);

  const session = await locals.auth.validate();
  if (!session) return response.error("Unauthorized", 401);

  const found = await db
    .select()
    .from(plugin)
    .where(
      and(
        eq(plugin.id, pluginId.data),
        eq(plugin.publisherId, session.user.userId)
      )
    )
    .limit(1);

  if (!found || found.length == 0)
    return response.error("Plugin not found", 404);

  return response.success(found[0]);
};

