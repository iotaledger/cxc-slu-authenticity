<script context="module" lang="ts">
	export const prerender = true;
	import { Box } from 'boxfish-studio--is-ui-components';
</script>

<script lang="ts">
	import { isAuthenticated, LoginRegisterManager } from 'boxfish-studio--is-ui-components';
</script>

<div class="container mt-4">
	<Box>
		<h3>Welcome to the CityxChange portal for IoT device management.</h3>

		<p class="mt-4">
			To manage IoT devices in the factory visit the <a href="/dashboard"> Dashboard page</a>.
		</p>
	</Box>
	{#if !$isAuthenticated}
		<LoginRegisterManager />
	{/if}
</div>
