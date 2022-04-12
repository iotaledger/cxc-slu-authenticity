<script>
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { isAuthenticated, NotificationManager } from 'boxfish-studio--is-ui-components';
	import { Container } from 'sveltestrap';
	import { Header } from '../components';
	import './../scss/main.scss';

	$: {
		if (browser && !$isAuthenticated) {
			goto('/');
		}
	}
</script>

<Header />
<NotificationManager />
<main>
	<Container>
		<slot />
	</Container>
</main>
