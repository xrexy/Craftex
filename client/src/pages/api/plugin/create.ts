import type { APIRoute } from "astro";

import { createId } from "$lib/helpers/cuid2";
import { getRequiredDataFromPluginYAML } from "$lib/helpers/parsers";
import { response } from "$lib/helpers/response";
import { uploadPluginSchema } from "$lib/validation";
import db from "$server/db";
import { plugin } from "$server/db/schema";
import {
  constructPluginKey,
  fileExits,
  uploadPlugin,
} from "$server/s3/helpers";
import { DatabaseError, type ExecutedQuery } from "@planetscale/database";

export const POST: APIRoute = async ({ locals, redirect, request }) => {
  const session = await locals.auth.validate();
  if (!session) return response.error("Unauthorized", 401);

  // -- 1 -- Make sure the form data is valid
  const data = await request.formData();
  let formDataName = data.get("name");
  const parseRes = uploadPluginSchema.safeParse({
    name: formDataName?.length == 0 ? null : formDataName,
    description: data.get("description"),
    version: data.get("version"),
    file: data.get("file"),
  });

  if (!parseRes.success) {
    const issue = parseRes.error.issues[0];
    return response.error(`Invalid ${issue.path.join(".")}: ${issue.message}`);
  }

  let name: string;
  const { description, file, name: requestedName } = parseRes.data;

  // -- 2 -- Parse the plugin.yml file
  const pluginMetadata = await getRequiredDataFromPluginYAML(file);
  if (pluginMetadata.failed) {
    return response.error(pluginMetadata.error);
  }

  const { name: metaName, version, main } = pluginMetadata.data;

  name = requestedName ?? metaName;

  // -- 4 -- Generate plugin "identifiers" (id, key)

  const key = constructPluginKey({
    main,
    version: pluginMetadata.data.version,
  });

  console.log(`New plugin key ${key}`);

  // -- 3 -- Make sure the plugin isn't uploaded already on the cdn
  const pluginExits = await fileExits(key);
  if (pluginExits) {
    return response.error(
      `Plugin with key '${key}' found on CDN. This is most likely a duplicate plugin version issue.`
    );
  }

  // -- 4 -- Insert the plugin into the database
  console.table({ action: `start inserting ${key}` });

  const pluginId = createId(true);

  let createRes: ExecutedQuery;
  try {
    createRes = await db.insert(plugin).values({
      phase: "draft",
      id: pluginId,
      publisherId: session.user.userId,
      name,
      description,
      versions: [version],
      // TODO handle socials as well
    });
  } catch (e) {
    if (e instanceof DatabaseError && e.message) {
      // this is sad but the best we can do with what the error body has
      if (e.message.includes("plugin.plugin_name_unique")) {
        return response.error(`Plugin with name '${name}' already exists.`);
      }
    }

    console.error(e);
    return response.error("Failed to create plugin. Please try again later.");
  }

  console.log(`inserted ${key}, affected`, createRes.rowsAffected);

  if (createRes.rowsAffected !== 1) {
    return response.error("Failed to create plugin. Please try again later.");
  }

  // -- 5 -- Upload the plugin to the CDN
  console.log(`${key}: uploading to cdn`);
  const uploadRes = await uploadPlugin(file, key);

  console.log(`${key}: uploaded`);

  if (uploadRes.failed) {
    return response.error(`Failed to upload plugin to CDN: ${uploadRes.error}`);
  }

  return response.success({
    pluginId,
    name,
  });
};

