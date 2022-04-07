<script lang="ts">
	import { Icon } from '@iota/is-ui-components';
	export let device;
</script>

<div class="identity-details w-100">
	<div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4">
		<div class="d-flex align-items-center">
			<Icon size={64} boxed boxColor="green" type="nut" />
			<div class="ms-4 me-4">
				<div class="fw-bold text-break">ID: {device.id}</div>
				<div class="text-secondary fst-italic mt-1 text-break">STATUS: {device.status}</div>
			</div>
		</div>
	</div>
	<div class="p-4 text-break">NONCE: {device.nonce}</div>
	<div class="p-4">AUTHENTICITY: {device.authenticity}</div>
	<div class="p-4">MESSAGES: {device.messages}</div>
</div>
