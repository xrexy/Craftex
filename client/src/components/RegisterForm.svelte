<script lang="ts">
  let errorMessage: string;
  let errorMessageTimeout: NodeJS.Timeout;

  async function handleSubmit(e: SubmitEvent) {
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data?.error) {
      errorMessage = data.error;
      errorMessageTimeout && clearTimeout(errorMessageTimeout);
      errorMessageTimeout = setTimeout(() => {
        errorMessage = "";
      }, 5000);

      return;
    }

    window.location.href = "/";
  }
</script>

<form>
  <form
    method="post"
    on:submit|preventDefault={handleSubmit}
  >
    <input
      class="border-2 border-gray-600"
      type="text"
      name="username"
      id="username"
    />
    <br />
    <input
      class="border-2 border-gray-600"
      type="password"
      name="password"
      id="password"
    />
    <input
      class="border-2 border-gray-600"
      type="password"
      name="repeatPassword"
      id="repeatPassword"
    />
    <button>Sign Up</button>
  </form>
</form>

{#if errorMessage}
  <div class="text-red-500">{errorMessage}</div>
{/if}
