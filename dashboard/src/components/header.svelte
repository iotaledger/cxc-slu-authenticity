<script lang="ts">
	import { goto } from '$app/navigation';
	import { authenticatedUserDID, isAuthenticated } from '@iota/is-ui-components';
	import { logout } from '@iota/is-ui-components';

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
	<NavbarBrand
		><img
			src="https://cityxchange.eu/wp-content/uploads/2018/02/logo.png"
			alt="CityXChange"
		/></NavbarBrand
	>
	{#if $isAuthenticated}
		<NavbarToggler on:click={() => (isOpen = !isOpen)} />
		<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
			<Nav class="ms-auto" navbar>
				<NavItem>
					<NavLink on:click={_logout}>Logout</NavLink>
				</NavItem>
			</Nav>
		</Collapse>
	{/if}
</Navbar>
{#if $authenticatedUserDID}
	<div class="user bg-primary text-white text-center text-break p-1">
		{$authenticatedUserDID}
	</div>
{/if}

<style lang="scss">
	img {
		height: 1em;
		cursor: auto;
		@media (min-width: 768px) {
			height: 2em;
		}
	}
	.user {
		font-size: 14px;
		@media (min-width: 768px) {
			font-size: 16px;
		}
	}
</style>
