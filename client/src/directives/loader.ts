import type { Action } from "svelte/action";
import type { Writable } from "svelte/store";
import SpinnerComponent from "$components/Spinner.svelte";

export const loader: Action<HTMLDivElement, Writable<boolean>> = (
  node,
  loading
) => {
  let Spinner: SpinnerComponent | undefined, loadingValue;

  const unsubscribe = loading.subscribe((loading) => {
    if (loading) {
      Spinner = new SpinnerComponent({
        target: node,
        intro: true,
      });
    } else {
      if (Spinner) {
        Spinner?.$destroy?.();
        Spinner = undefined;
      }
    }
  });
};

