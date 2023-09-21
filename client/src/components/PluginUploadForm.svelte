<script lang="ts">
  import { uploadPluginSchema } from "$lib/validation";

  let errorMessage: string;
  let errorMessageTimeout: NodeJS.Timeout;

  async function setErrorMessage(error: typeof errorMessage) {
    errorMessage = error;

    errorMessageTimeout && clearTimeout(errorMessageTimeout);
    errorMessageTimeout = setTimeout(() => {
      errorMessage = "";
    }, 3000);
  }

  async function handleSubmit(e: SubmitEvent) {
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    // validate on client before sending to server to minimize useless requests
    // make sure also validated on server-side

    const formDataName = formData.get("name");
    const parseRes = uploadPluginSchema.safeParse({
      name: formDataName?.length == 0 ? null : formDataName,
      description: formData.get("description"),
      file: formData.get("file"),
    });

    console.log(parseRes);

    if (!parseRes.success) {
      const issue = parseRes.error.issues[0];
      return setErrorMessage(
        `Invalid ${issue.path.join(".")}: ${issue.message}`
      );
    }

    if (parseRes.data?.name) {
      console.log("bro wtf is going on");
      const existsReq = await fetch(
        `/api/plugin/exists_with_name?name=${parseRes.data.name}`
      );

      if (existsReq.status != 200)
        return setErrorMessage("Sorry, we couldn't verify that plugin name");

      const { data: existsRes } = await existsReq.json();
      console.log(existsRes, "existsRes");
      if (existsRes?.exists) {
        return setErrorMessage("Plugin with that name already exists");
      }
    }

    const request = await fetch("/api/plugin/create", {
      method: "POST",
      body: formData,
    });

    const response = await request.json();

    if (response?.error) return setErrorMessage(response.error);

    // TODO toasts

    window.location.href = "/plugins/view";
  }
</script>

<form
  method="post"
  enctype="multipart/form-data"
  on:submit|preventDefault={handleSubmit}
>
  <textarea
    name="description"
    placeholder="Description"
  />

  <input
    name="name"
    placeholder="Name"
    required={false}
  />

  <input
    type="file"
    name="file"
    accept=".jar"
  />

  <button type="submit">Upload</button>
</form>

{#if errorMessage}
  <div class="text-red-500">{errorMessage}</div>
{/if}

<style scoped>
  input,
  textarea {
    @apply border-2 border-gray-600;
  }
</style>
