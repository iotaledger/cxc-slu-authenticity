<script lang="ts">
	import { authenticatedUserDID, isAuthenticated } from 'boxfish-studio--is-ui-components';
	import { showNotification, NotificationType } from 'boxfish-studio--is-ui-components';
	import { Button } from 'sveltestrap';

	function push() {
		showNotification({
			type: NotificationType.Info,
			message: 'Example of info from Identity Manager'
		});
	}
</script>

<h3>Welcome to Identity Manager</h3>

User DID: {$authenticatedUserDID}

<br />

Is Authenticated: {$isAuthenticated}

<br />

<Button on:click={push}>Notification Example</Button>
