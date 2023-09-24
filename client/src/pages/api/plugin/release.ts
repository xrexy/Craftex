import type { APIRoute } from "astro";

import { response } from "$lib/helpers/response";
import { pluginReleaseSchema } from "$lib/validation";
import { getRequiredDataFromPluginYAML } from "$lib/helpers/parsers";
import {
  constructPluginKey,
  fileExits,
  uploadFile,
  uploadPlugin,
} from "$server/s3/helpers";
import db from "$server/db";
import { plugin as dbPlugin } from "$server/db/schema";

export const POST: APIRoute = async ({ request, locals }) => {
  const session = await locals.auth.validate();
  if (!session) return response.error("Unauthorized", 401);

  const formData = await request.formData();
  let formPlugin = formData.get("plugin") as string;
  if(!formPlugin) {
    return response.error("Plugin not found in request");
  }
  
  formPlugin = JSON.parse(formPlugin);

  console.log("formPlugin", formPlugin)

  const validation = pluginReleaseSchema.safeParse({
    file: formData.get("file"),
    plugin: formPlugin,
  });

  // TODO plugin shouldn't be passed over the network, just pluginid should be sent and fetched here
  // but atm there's no store on the frontend and the plugin is already fetched there to be displayed soooooo fine for now(pls change)

  if (!validation.success) {
    // TODO add a helper function
    const issue = validation.error.issues[0];
    return response.error(`Invalid ${issue.path.join(".")}: ${issue.message}`);
  }

  const { file, plugin } = validation.data;
  const pluginMetadata = await getRequiredDataFromPluginYAML(file);
  if (pluginMetadata.failed) {
    return response.error(pluginMetadata.error);
  }

  const { version, main } = pluginMetadata.data;
  if (plugin.versions.includes(version)) {
    return response.error(`Version ${version} already exists`);
  }

  const key = constructPluginKey({
    main,
    version,
  });

  const fileExists = await fileExits(key);
  if (fileExists) {
    return response.error(
      `Version ${version} (key: ${key}) already exists on our CDN. Message an admin if you think this is a mistake`
    );
  }

  // update versions
  plugin.versions.push(version);
  const updateRes = await db.update(dbPlugin).set({
    versions: plugin.versions,
  });

  if (updateRes.rowsAffected == 0) {
    return response.error("Failed to update plugin versions", 500);
  }

  // upload file
  const uploadRes = await uploadPlugin(file, key);
  if (uploadRes.failed) {
    // rollback update
    plugin.versions.pop();
    const rollbackRes = await db.update(dbPlugin).set({
      versions: plugin.versions,
    });

    return response.error(uploadRes.error);
  }

  return response.success({
    pluginId: plugin.id,
  });
};

