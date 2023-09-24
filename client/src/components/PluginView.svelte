<script lang="ts">
  import { writable } from "svelte/store";
  import Plugin from "$components/PluginViewItem.svelte";

  let loading = writable(true);

  // TODO: stores
  const pluginsPromise = fetch("/api/plugin/user_owned")
    .then((res) => res.json())
    .then((res) => res.data as import("$lib/types").Plugin[]);
</script>

<div class="flex flex-row items-center justify-center pt-2 pb-4 gap-x-4">
  <h1 class="text-xl font-bold">Owned Plugins</h1>
  <a
    class="px-4 py-1 font-bold rounded-full bg-cyan-400"
    href="/plugins/upload"
  >
    Upload
  </a>
</div>

{#await pluginsPromise}
  Loading yours plugins...
{:then plugins}
  {#each plugins as plugin}
    <Plugin {plugin} />
  {/each}
{:catch error}
  <p>Something happened while fetching plugins</p>
{/await}
