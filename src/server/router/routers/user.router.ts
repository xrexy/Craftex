import { z } from "zod";
import { createProtectedRouter } from "@protected-router";

export const UserDto = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const userRouter = createProtectedRouter().query("all", {
  resolve: ({ ctx: { prisma: db } }) => db.user.findMany(),
});
