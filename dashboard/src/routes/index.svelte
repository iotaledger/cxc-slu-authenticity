<script lang="ts">
	import { isAuthenticated, LoginRegisterManager } from '@iota/is-ui-components';
	import { Dashboard } from '../components';
</script>

<div class="container mt-4">
	{#if $isAuthenticated}
		<Dashboard />
	{:else}
		<LoginRegisterManager />
	{/if}
</div>
