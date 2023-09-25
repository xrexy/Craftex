<script lang="ts">
  import type { SubmitFn } from "$lib/types";
  import { getFormDataFromSubmitEvent } from "$lib/helpers/web";

  export let pluginId: string;

  let loading = true;

  let error: string;
  let plugin: import("$lib/types").Plugin | null = null;

  console.log('alo?')
  // TODO add a global store instead of fetching everything everywhere
  fetch(`/api/plugin/${pluginId}`)
    .then((res) => res.json())
    .then(({ data }) => {
      plugin = data;
      loading = false;
    })
    .catch((e) => {
      error = e.message;
      loading = false;
    });

  const handleSubmit: SubmitFn = async (e) => {
    const formData = getFormDataFromSubmitEvent(e);
    const file = formData.get("file") as Blob;

    if(!plugin) {
      error = "Plugin not found";
      return;
    }

    if (!file || file.size < 1) {
      error = "Please select a file";
      return;
    }

    // TODO change route to /api/plugin/:pluginId/release
    
    const releaseFormData = new FormData();
    releaseFormData.set("file", file);
    releaseFormData.set("plugin", JSON.stringify(plugin))
    const releaseRes = await fetch(`/api/plugin/release`, {
      method: "POST",
      body: releaseFormData,
    });

    if (!releaseRes.ok) {
      error = "Something went wrong";
      return;
    }

    const { data } = await releaseRes.json();
    console.log(data);    
  };
</script>

{#if loading}
  <p>Please wait we load your plugin...</p>
{:else if !!plugin}
  <p>New Release - <strong>{plugin.name}</strong></p>
  <form on:submit|preventDefault={handleSubmit}>
    <input
      type="file"
      accept=".jar"
      name="file"
    />

    <!-- TODO changelog and other metadata -->

    <button> Submit Release </button>
  </form>
{:else if error}
  <p>Something went wrong {error}</p>
{/if}
