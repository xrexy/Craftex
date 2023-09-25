export const pluginPhases = ["draft", "published", "archived"] as const;
export type PluginPhase = (typeof pluginPhases)[number];

export type PluginSocials = {
  github?: string;
  discord?: string;
  website?: string;
};

export type User = {
  id: string;
  username: string;
};

export type Key = {
  id: string;
  userId: string;
  hashedPassword: string;
};

export type Session = {
  id: string;
  userId: string;
  activeExpires: number;
  idleExpires: number;
};

export type Plugin = {
  id: string;
  name: string;
  description: string;
  phase: PluginPhase;
  versions: string[];
  socials: PluginSocials;
  publisherId: string;
  createdAt: number;
  updatedAt: number;
};

