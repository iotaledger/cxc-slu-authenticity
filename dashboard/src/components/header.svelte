<script lang="ts">
	import { goto } from '$app/navigation';
	import { authenticatedUserDID, isAuthenticated } from 'boxfish-studio--is-ui-components';
	import { logout } from 'boxfish-studio--is-ui-components';

	import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'sveltestrap';

	let isOpen = false;

	function handleUpdate(event) {
		isOpen = event.detail.isOpen;
	}

	async function _logout() {
		logout();
		goto('/');
	}
</script>

<Navbar color="light" light expand="md">
	<NavbarBrand href="/"
		><img style="height: 2em" src="/imgs/cityxchange.jpg" alt="CityXChange" /></NavbarBrand
	>

	<NavbarToggler on:click={() => (isOpen = !isOpen)} />
	<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
		<Nav class="ms-auto" navbar>
			{#if $isAuthenticated}
				<NavItem>
					<NavLink href="/secure/identity">Identity</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/secure/streams">Streams</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/dashboard">Dashboard</NavLink>
				</NavItem>
				<NavItem>
					<NavLink on:click={_logout}>Logout</NavLink>
				</NavItem>
			{:else}
				<NavItem>
					<NavLink href="/">Login</NavLink>
				</NavItem>
			{/if}
		</Nav>
	</Collapse>
</Navbar>
<div class="bg-primary text-white text-center text-break p-1">
	{#if $authenticatedUserDID}
		{$authenticatedUserDID}
	{/if}
</div>
