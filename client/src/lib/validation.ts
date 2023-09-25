import { z } from "zod";

import { CUID2_LENGTH } from "./constants";
import {
  pluginPhases,
  type Plugin,
  type PluginPhase,
  type PluginSocials,
} from "./types";

export const usernameSchema = z.string().min(4).max(64);
export const passwordSchema = z.string().min(8).max(255);
export const usernameWithPasswordSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const cuid2Schema = z.string().length(CUID2_LENGTH);

export const requiredYAMLPluginDataSchema = z.object({
  name: z.string(),
  version: z.string(),
  main: z.string(),
  description: z.string().optional().nullable(),
});

export const blobSchema = z
  .instanceof(Blob)
  .refine((file) => file.size < 1024 * 1024 * 10, {
    message: "File must be less than 10MB",
  })
  .refine((file) => file.size > 0, {
    message: "File is required",
  });

export const jarFileSchema = blobSchema
  // TODO check mime type is application/java-archive
  .refine((file) => file.name.endsWith(".jar"), {
    message: "File must be a .jar",
  });

export const pluginPhaseSchema: z.ZodType<PluginPhase> = z.enum(pluginPhases);
export const pluginSocialSchema: z.ZodType<PluginSocials> = z.object({
  github: z.string().url().optional(),
  discord: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const luciaIdSchema = z.string().min(15); // not sure what the actual length is

export const pluginSchema = z.object({
  id: cuid2Schema,
  name: z.string().min(4).max(64),
  description: z.string().min(16).max(1024),
  phase: pluginPhaseSchema,
  versions: z.array(z.string()),
  socials: pluginSocialSchema,
  publisherId: luciaIdSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const uploadPluginSchema = z.object({
  name: z.string().min(4).max(64).nullable().optional(),
  description: z.string().min(16).max(1024).nullable().optional(),
  file: jarFileSchema,
});

export const pluginReleaseSchema = z.object({
  file: jarFileSchema,
  plugin: pluginSchema,
});

