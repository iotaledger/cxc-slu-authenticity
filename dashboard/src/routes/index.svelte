<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
    import { authenticatedUserDID, isAuthenticated } from '@iota/is-ui-components'
    import { LoginRegisterManager } from '@iota/is-ui-components'
	import { showNotification, NotificationType } from '@iota/is-ui-components';

	function push() {
		showNotification({
			type: NotificationType.Error,
			message: 'There was an error searching for user',
		});
	}
</script>

<h3>This it the main page for CxC</h3>

Here some information about the project...

User DID: {$authenticatedUserDID}

Is Authenticated: {$isAuthenticated}

<LoginRegisterManager></LoginRegisterManager>

