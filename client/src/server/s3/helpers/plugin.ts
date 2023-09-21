import type { Plugin } from "$lib/types";

import { uploadFile } from "./generic";
import { getRequiredDataFromPluginYAML } from "$lib/helpers/parsers";

export type ConstructPluginKeyInput = {
  main: string;
  version: string;
};

export const constructPluginKey = ({
  main,
  version,
}: ConstructPluginKeyInput) =>
  // i know this is dumb might think of something better later.. (i wont)
  `${main.split(".").slice(0, 3).join(".")}/${version}`;

export const uploadPlugin = async (
  file: Blob,
  key: string
): Promise<
  | {
      failed: false;
    }
  | {
      failed: true;
      error: string;
    }
> => {
  const jarInfo = await getRequiredDataFromPluginYAML(file);
  if (jarInfo.failed) {
    return {
      failed: true,
      error: jarInfo.error,
    };
  }

  console.log("Uploading plugin", key);

  const uploadIsSuccessfull = await uploadFile(key, file);
  if (!uploadIsSuccessfull) {
    return {
      failed: true,
      error: "Upload failed",
    };
  }

  return {
    failed: false,
  };
};

