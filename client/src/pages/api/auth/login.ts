import type { APIRoute } from "astro";
import { LuciaError } from "lucia";

import { LuciaProviderIds } from "$lib/constants";
import { response } from "$lib/helpers/response";
import auth from "$lib/lucia";
import type { LuciaErrorMessage } from "$lib/types";
import { usernameWithPasswordSchema } from "$lib/validation";

const safeLuciaErrors: LuciaErrorMessage[] = [
  "AUTH_INVALID_KEY_ID",
  "AUTH_INVALID_PASSWORD",
];

export const POST: APIRoute = async ({ locals, request }) => {
  const formData = await request.formData();

  const parseRes = usernameWithPasswordSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parseRes.success) {
    return response.error("Invalid username or password");
  }

  const { password, username } = parseRes.data;

  console.table({
    username,
    password,
  });

  try {
    const key = await auth.useKey(
      LuciaProviderIds["username"],
      username.toLowerCase(),
      password
    );

    console.log("Found key", key);

    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });

    console.log("Created session", session);

    locals.auth.setSession(session);

    return response.success();
  } catch (e) {
    // TODO handle errors better

    if (e instanceof LuciaError && safeLuciaErrors.includes(e.message)) {
      console.log("LuciaError", e.message);

      return response.error("Invalid username or password");
    } else {
      console.error(e);
      return response.error("An unknown error occurred");
    }
  }
};

