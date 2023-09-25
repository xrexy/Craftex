<script lang="ts">
  export let plugin: import("$lib/types").Plugin;
</script>

<!-- god damn looks terrible will deal with styling later on -->

<div
  class="flex items-center justify-between px-8 py-2 border-b-2 last:border-none border-gray-600/25 gap-x-4 bg-gray-500/10"
>
  <div>
    <p class="font-bold">
      {plugin.name} <span class="font-normal">({plugin.phase})</span>
    </p>
    <p class="text-gray-500">{plugin.description}</p>
    <p>Latest: <span class="text-cyan-500">{plugin.versions.at(-1)}</span></p>
  </div>

  <a
    class="px-4 py-1 rounded-full bg-cyan-400"
    href={`/plugins/release?pluginId=${plugin.id}&publisherId=${plugin.publisherId}`}
  >
    New Release
  </a>
</div>
