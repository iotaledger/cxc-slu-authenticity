<script lang="ts">
	import { createDevice, getDeviceNonce, getDevices } from '$lib/device';

	import DeviceDetails from '$lib/device-details/device-details.svelte';
	import type { Device } from '$lib/device/types';
	import {
		acceptSubscription,
		authenticationData,
		createChannel,
		selectedChannel,
		type ActionButton,
		type TableData
	} from '@iota/is-ui-components';
	import { Icon, ListManager, NotificationManager } from '@iota/is-ui-components';
	import { onMount } from 'svelte';
	import { Container, Row } from 'sveltestrap';

	onMount(async () => {
		await loadDevices();
	});

	async function loadDevices() {
		devices = await getDevices($authenticationData?.did);
	}
	enum State {
		ListDevices = 'listDevices',
		DeviceDetails = 'deviceDetails'
	}

	const DEVICE_LIST_BUTTONS: ActionButton[] = [
		{
			label: 'Create device',
			onClick: handleCreateDevice,
			icon: 'plus',
			color: 'dark'
		}
	];

	let devices = [];

	let state: State = State.ListDevices;
	let message: string;
	let selectedDevice: Device;

	let loading = false;

	$: selectedDevice, updateState();
	$: message = devices?.length ? 'No devices found' : undefined;

	$: tableData = {
		headings: ['Device Id', 'Channel Address'],
		rows: devices.map((device) => ({
			onClick: () => handleSelectDevice(device),
			content: [
				{
					icon: 'nut',
					boxColor: 'green',
					value: device.id ?? '-'
				},
				{
					value: device.channelAddress ?? '-'
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

	let channel;
	async function handleCreateDevice() {
		channel = await createChannel([{ type: 'cxc', source: 'cxc' }]);
		if (channel) {
			const device = await createDevice(channel?.channelAddress, $authenticationData?.did);
			if (device) {
				await acceptSubscription(channel?.channelAddress, device?.id);
			}
		}
		await loadDevices();
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
