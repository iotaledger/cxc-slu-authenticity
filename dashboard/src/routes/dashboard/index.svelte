<script lang="ts">
	import DeviceDetails from '$lib/device-details/device-details.svelte';
	import type { Device } from '$lib/device/types';
	import type { ActionButton, TableData } from '@iota/is-ui-components';
	import { Icon, ListManager, NotificationManager } from '@iota/is-ui-components';
	import { Container, Row } from 'sveltestrap';

	enum State {
		ListDevices = 'listDevices',
		DeviceDetails = 'deviceDetails'
	}

	const DEVICE_LIST_BUTTONS: ActionButton[] = [
		{
			label: 'Create device',
			onClick: createDevice,
			icon: 'plus',
			color: 'dark'
		}
	];

	let devices = [
		{
			id: 'device 1',
			status: 'Active',
			nonce: 'nonce',
			authenticity: 'authenticity',
			messages: 'messages'
		}
	];

	let state: State = State.ListDevices;
	let message: string;
	let selectedDevice: Device;

	$: selectedDevice, updateState();
	$: message = devices?.length ? 'No devices found' : undefined;

	$: tableData = {
		headings: ['Device Id', 'Nonce'],
		rows: devices.map((device) => ({
			onClick: () => handleSelectDevice(device),
			content: [
				{
					icon: 'nut',
					boxColor: 'green',
					value: device.id ?? '-'
				},
				{
					value: device.nonce ?? '-'
				}
			]
		}))
	} as TableData;

	async function updateState(): Promise<void> {
		if (selectedDevice) {
			state = State.DeviceDetails;
		} else {
			state = State.ListDevices;
			// stopReadingChannel();
		}
	}

	function handleSelectDevice(device): void {
		selectedDevice = device;
	}

	function createDevice() {
		// TODO: Add correct logic here
		devices = [
			...devices,
			{
				id: `device ${++devices.length}`,
				status: 'Active',
				nonce: 'nonce',
				authenticity: 'authenticity',
				messages: 'messages'
			}
		];
	}

	function handleBackClick(): void {
		selectedDevice = null;
	}
</script>

<Container class="py-5">
	<Row class="mb-4">
		<h1>Device Manager</h1>
	</Row>
	{#if state === State.ListDevices}
		<ListManager {tableData} {message} actionButtons={DEVICE_LIST_BUTTONS} />
	{:else if state === State.DeviceDetails}
		<div class="mb-4 align-self-start">
			<button on:click={handleBackClick} class="btn d-flex align-items-center">
				<Icon type="arrow-left" size={16} />
				<span class="ms-2">Back</span>
			</button>
		</div>
		{#if selectedDevice}
			<DeviceDetails device={selectedDevice} />
		{/if}
	{/if}
</Container>

<NotificationManager />
