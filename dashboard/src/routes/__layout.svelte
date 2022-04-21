<script>
	import { NotificationManager } from '@iota/is-ui-components';
	import { Container } from 'sveltestrap';
	import { Header } from '../components';
	import './../scss/main.scss';
</script>

<Header />
<NotificationManager />
<main>
	<Container>
		<slot />
	</Container>
</main>
