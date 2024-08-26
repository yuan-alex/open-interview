<script>
import Home from "./Home.svelte";
import Interview from "./Interview.svelte";

import { router } from "./stores/router";
</script>

{#if router?.get()?.route === "home"}
  <Home />
{/if}

{#if router?.get()?.route === "interview"}
  <Interview />
{/if}
