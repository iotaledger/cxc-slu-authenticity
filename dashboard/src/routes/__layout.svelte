
<script>
	import Header from "$lib/header/Header.svelte";
  import { onMount } from "svelte/internal";
  import { Container } from 'sveltestrap';
	import { goto } from '$app/navigation';
	import { logged } from '$lib/store.js';

  onMount(() => {
    if (!$logged && window.location.pathname !== "/") {
      goto("/");
    }
  })
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css">
</svelte:head>

<Header />

<Container>
  <slot></slot>
</Container>

