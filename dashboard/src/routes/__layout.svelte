<script>
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { isAuthenticated, NotificationManager } from 'boxfish-studio--is-ui-components';
	import { Container } from 'sveltestrap';
	import { Header } from '../components';

	$: {
		if (browser && !$isAuthenticated) {
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
<main>
	<Container>
		<slot />
	</Container>
</main>
