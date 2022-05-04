<script>
	import { NotificationManager } from '@iota/is-ui-components';
	import { startPollExpirationCheckJWT, stopPollExpirationCheckJWT } from '@iota/is-ui-components';
	import { onMount } from 'svelte';
	import { Container } from 'sveltestrap';
	import { Header } from '../components';
	import './../scss/main.scss';

	onMount(() => {
		startPollExpirationCheckJWT();
		return () => {
			stopPollExpirationCheckJWT();
		};
	});
</script>

<Header />
<NotificationManager />
<main>
	<Container>
		<slot />
	</Container>
</main>
