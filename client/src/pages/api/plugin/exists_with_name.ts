import { response } from "$lib/helpers/response";
import db from "$server/db";
import { plugin } from "$server/db/schema";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const existsWithNameRequestSchema = z.object({
  name: z.string().min(4).max(64),
});

// TODO caching
export const GET: APIRoute = async ({ locals, redirect, request, url }) => {
  const parseRes = existsWithNameRequestSchema.safeParse({
    name: url.searchParams.get("name"),
  });

  if (!parseRes.success) {
    const issue = parseRes.error.issues[0];
    return response.error(`Invalid ${issue.path.join(".")}: ${issue.message}`);
  }

  const { name } = parseRes.data;

  const existRes = await db
    .select({ id: plugin.id })
    .from(plugin)
    .where(eq(plugin.name, name))
    .limit(1);

  let res = { exists: false } as any; // ehhh just to return
  if (existRes.length > 0) {
    res = { exists: true, id: existRes[0].id };
  }

  return response.success(res);
};

