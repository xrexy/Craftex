import { lucia } from "lucia";
import { astro } from "lucia/middleware";
import { planetscale } from "@lucia-auth/adapter-mysql";

import TableNames from "$server/db/table_names";
import { connection } from "$server/db";
import { omit, pick } from "./helpers/object";

export const auth = lucia({
  adapter: planetscale(connection, pick(TableNames, "key", "session", "user")),
  middleware: astro(),
  env: import.meta.env.DEV ? "DEV" : "PROD",
  getUserAttributes: (data) => {
    return {
      username: data.username,
    };
  },
});

export type Auth = typeof auth;

export default auth;
