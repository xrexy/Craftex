import type { ValidLuciaProviderIds } from "./types";

export const CUID2_LENGTH = 64;

type VLPI = ValidLuciaProviderIds;
export const LuciaProviderIds: Record<VLPI, VLPI> = {
  username: "username",
  github: "github",
} as const;

