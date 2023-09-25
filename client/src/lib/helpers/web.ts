import type { SubmitFn } from "$lib/types";

export const getFormDataFromSubmitEvent: SubmitFn<FormData> = (e) =>
  new FormData(e.currentTarget as HTMLFormElement);

