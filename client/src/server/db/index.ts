import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

export const connection = connect({
  url: import.meta.env.DB_URL,
});
export const db = drizzle(connection);

export default db;

export * as tables from "./schema";
