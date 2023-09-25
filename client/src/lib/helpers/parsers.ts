import YAML from "js-yaml";
import JSZip from "jszip";
import type { z } from "zod";

import type { FailableResponse } from "$lib/types";
import { requiredYAMLPluginDataSchema } from "$lib/validation";

export type SupportedPluginTypes = "bukkit" | "sponge";

export type YAMLRequiredPluginData = z.infer<
  typeof requiredYAMLPluginDataSchema
>;

export const parseBlobToJSZip = async (file: Blob, zipInstance: JSZip) => {
  return zipInstance.loadAsync(await file.arrayBuffer());
};

export const extractPluginMetadata = async (
  file: JSZip.JSZipObject,
  type: SupportedPluginTypes,
  zipInstance: JSZip
) => {
  return file.async("string").then((data) => {
    let toParse: any;
    if (type == "bukkit") toParse = YAML.load(data);
    // TODO infer sponge plugin.links
    else if (type == "sponge") {
      const { plugins } = JSON.parse(data);
      if (plugins.length == 0) {
        throw new Error("No plugins found in sponge_plugins.json");
      }

      const plugin = plugins[0];
      toParse = {
        main: plugin.entrypoint,
        version: plugin.version,
        name: plugin.name,
      };
    } else throw new Error("Invalid extractPluginMetadata type");

    // sponge is json, bukkit is yaml
    return requiredYAMLPluginDataSchema.parse(toParse);
  });
};

export const getRequiredDataFromPluginYAML = async (
  file: Blob,
  time = true
): Promise<FailableResponse<YAMLRequiredPluginData>> => {
  time && console.time(`getRequiredDataFromPluginYAML/${file.name}`);
  const jszip = new JSZip();

  let zip: JSZip;
  try {
    zip = await parseBlobToJSZip(file, jszip);
  } catch (e) {
    console.error(e);
    return {
      failed: true,
      error: "Failed to parse jszip from blob. Is it a valid .jar file?",
    };
  }

  console.log(
    file.name,
    Object.keys(zip.files).filter((x) => x.includes(".json"))
  );

  let contents: YAMLRequiredPluginData;
  try {
    let type: SupportedPluginTypes = "bukkit";
    let targetFile = zip.file("plugin.yml");

    if (!targetFile) {
      targetFile = zip.file("META-INF/sponge_plugins.json");
      if (targetFile) type = "sponge";
      else {
        return {
          failed: true,
          error:
            "We couldn't extract the plugin metadata from the file, are you sure the file is correct?",
        };
      }
    }

    contents = await extractPluginMetadata(targetFile, type, jszip);
  } catch (e) {
    console.error(e);
    return {
      failed: true,
      error: "Failed to parse plugin.yml",
    };
  }

  time && console.timeEnd(`getRequiredDataFromPluginYAML/${file.name}`);
  return {
    failed: false,
    data: contents,
  };
};

