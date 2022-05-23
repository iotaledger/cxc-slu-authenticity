<script lang="ts">
	import { Button, Input, Modal, ModalBody, ModalHeader } from 'sveltestrap';
	export let value = '';
	export let onClick = () => {};
	export let isOpen = false;
	const toggle = () => {
		isOpen = !isOpen;
		value = '';
	};
</script>

<div class="w-100">
	<Modal {isOpen} {toggle}>
		<ModalHeader class="px-4 pt-3" {toggle}>Device Name</ModalHeader>
		<ModalBody class="px-4 pb-4">
			<Input bsSize="lg" bind:value placeholder="Device Name" />
			<div class="modal-footer">
				<Button
					disabled={value.length === 0}
					size="lg"
					color="primary"
					type="submit"
					on:click={onClick}>OK</Button
				>
			</div>
		</ModalBody>
	</Modal>
</div>