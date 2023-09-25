import {
  bigint,
  json,
  mysqlTable,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

import { pluginPhases, type PluginSocials } from "$lib/types";

import { CUID2_LENGTH } from "$lib/constants";
import TableNames from "./table_names";

export const user = mysqlTable(TableNames.user, {
  id: varchar("id", {
    length: 15,
  }).primaryKey(),

  username: varchar("username", {
    length: 64,
  }).notNull(),
});

export const key = mysqlTable(TableNames.key, {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  }).notNull(),
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});

export const session = mysqlTable(TableNames.session, {
  id: varchar("id", {
    length: 128,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  }).notNull(),
  activeExpires: bigint("active_expires", {
    mode: "number",
  }).notNull(),
  idleExpires: bigint("idle_expires", {
    mode: "number",
  }).notNull(),
});

// downloads POC: store in kv until new version is released, then move to mysql and start new kv counter

// TODO: ratings/reviews, contributors, tags, downloads etc
export const plugin = mysqlTable(TableNames.plugin, {
  // use '$lib/helpers/cuid2.ts' to create
  id: varchar("id", {
    length: CUID2_LENGTH,
  }).primaryKey(),

  name: varchar("name", {
    length: 64,
  })
    .unique()
    .notNull(),

  description: varchar("description", {
    length: 1024,
  }).notNull(),

  phase: varchar("phase", {
    enum: pluginPhases,
    length: 16,
  }).notNull(),

  // TODO: per version metadata (release date, downloads, changelog etc)
  // new versions will be pushed to the end of the array. So sorting will be: oldest => newest
  versions: json("versions").$type<string[]>().notNull(),

  socials: json("socials").$type<PluginSocials>().default({}).notNull(),

  publisherId: varchar("publisher_id", {
    length: 15,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
