import { CUID2_LENGTH } from "$lib/constants";
import { init } from "@paralleldrive/cuid2";

const fingerprint = import.meta.env.CUID2_FINGERPRINT;

if (!fingerprint) {
  throw new Error(
    "CUID2_FINGERPRINT is not set in .env. Might be caused by this running client-side."
  );
}

export const createId = (time?: boolean): string => {

  const _createId = init({
    length: CUID2_LENGTH,
    fingerprint,
  });

  if (time) {
    console.time("createId");
    const id = _createId();
    console.timeEnd("createId");
    return id;
  }

  return _createId();
};

