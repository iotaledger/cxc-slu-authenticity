<script lang="ts">
    import { authenticatedUserDID, isAuthenticated } from '@iota/is-ui-components'
	import { showNotification, NotificationType } from '@iota/is-ui-components';
    import { Button } from 'sveltestrap';

	function push() {
		showNotification({
			type: NotificationType.Info,
			message: 'Example of info from Stream Manager',
		});
	}
</script>

<h3>Welcome to Stream Manager</h3>

User DID: {$authenticatedUserDID}

<br/>

Is Authenticated: {$isAuthenticated}

<br/>

<Button on:click={push}>Notification Example</Button>
