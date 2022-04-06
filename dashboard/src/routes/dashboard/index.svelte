<script lang="ts">
	import { authenticatedUserDID, isAuthenticated } from '@iota/is-ui-components';
	import { showNotification, NotificationType } from '@iota/is-ui-components';
	import { goto } from '$app/navigation';
	import { Button } from 'sveltestrap';

	function push() {
		showNotification({
			type: NotificationType.Info,

			message: 'Example of info from Dashboard'
		});
	}
	$: {
		if (!$isAuthenticated) {
			goto('/');
		}
	}
</script>

<h3>Dashboard</h3>

User DID: {$authenticatedUserDID}

<br />

Is Authenticated: {$isAuthenticated}

<br />

<Button on:click={push}>Notification Example</Button>
