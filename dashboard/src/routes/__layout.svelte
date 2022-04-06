<script>
	import Header from '$lib/header/Header.svelte';
	import { Container } from 'sveltestrap';
	import { NotificationManager } from '@iota/is-ui-components';
	import { isAuthenticated } from '@iota/is-ui-components';
	import { goto } from '$app/navigation';

	$: {
		if (!$isAuthenticated) {
			goto('/');
		}
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css"
	/>
</svelte:head>

<Header />

<NotificationManager />

<Container>
	<slot />
</Container>
