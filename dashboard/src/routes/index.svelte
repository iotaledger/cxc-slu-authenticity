<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
    import { isAuthenticated, LoginRegisterManager } from '@iota/is-ui-components'
</script>

<h3>This it the main page for CxC</h3>

Here some information about the project...

{#if !$isAuthenticated}
	<LoginRegisterManager></LoginRegisterManager>
{/if}
