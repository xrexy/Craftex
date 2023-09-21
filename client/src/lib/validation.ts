import { z } from "zod";

const shouldDisableMin = true;
const disableMin = shouldDisableMin && import.meta.env.DEV;

export const uploadPluginSchema = z.object({
  name: z
    .string()
    .min(disableMin ? 1 : 4)
    .max(64)
    .nullable()
    .optional(),
  description: z
    .string()
    .min(disableMin ? 1 : 16)
    .max(1024)
    .nullable()
    .optional(),
  file: z
    .instanceof(Blob)
    .refine((file) => file.size < 1024 * 1024 * 10, {
      message: "File must be less than 10MB",
    })
    .refine((file) => file.size > 0, {
      message: "File is required",
    })
    // TODO check mime type is application/java-archive
    .refine((file) => file.name.endsWith(".jar"), {
      message: "File must be a .jar",
    }),
});

export const usernameSchema = z.string().min(4).max(64);
export const passwordSchema = z.string().min(8).max(255);
export const usernameWithPasswordSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const requiredYAMLPluginDataSchema = z.object({
  name: z.string(),
  version: z.string(),
  main: z.string(),
  description: z.string().optional().nullable(),
});

