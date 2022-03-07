<script lang="ts">
	import { goto } from '$app/navigation';
	import { logged } from '../store.js';

	import {
		Collapse,
		Navbar,
		NavbarToggler,
		NavbarBrand,
		Nav,
		NavItem,
		NavLink,
	} from 'sveltestrap';


	let isOpen = false;

	function handleUpdate(event) {
		isOpen = event.detail.isOpen;
	}

	function login() {
		// TODO: show login page and save Token when handshake is good
		$logged = true
	}

	function logout() {
		// Clear also Token information saved in store
		$logged = false;
		goto("/")
	}
</script>

<Navbar color="light" light expand="md">
	<NavbarBrand href="/">CxC</NavbarBrand>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} />
	<Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
		<Nav class="ms-auto" navbar>
			{#if $logged}
			<NavItem>
				<NavLink href="/identity">Identity</NavLink>
			</NavItem>
			<NavItem>
				<NavLink href="/streams">Streams</NavLink>
			</NavItem>
			<NavItem>
				<NavLink on:click={logout}>Logout</NavLink>
			</NavItem>
			{:else}
			<NavItem>
				<NavLink on:click={login}>Login</NavLink>
			</NavItem>
			{/if}
		</Nav>
	</Collapse>
</Navbar>
