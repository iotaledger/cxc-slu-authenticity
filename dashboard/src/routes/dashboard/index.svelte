<script lang="ts">
	import { createDevice, getDevices } from '$lib/device';
	import { DeviceDetails } from '../../components';
	import type { Device } from '$lib/device/types';
	import {
		authenticationData,
		Icon,
		ListManager,
		NotificationManager,
		type ActionButton,
		type TableData
	} from 'boxfish-studio--is-ui-components';
	import { onMount } from 'svelte';
	import { Container, Row } from 'sveltestrap';

	onMount(async () => {
		await loadDevices();
	});

	enum State {
		ListDevices = 'listDevices',
		DeviceDetails = 'deviceDetails'
	}

	let DEVICE_LIST_BUTTON: ActionButton = {
		label: 'Create device',
		onClick: handleCreateDevice,
		icon: 'plus',
		color: 'dark'
	};
	let devices = [];
	let loading: boolean = false;
	let state: State = State.ListDevices;
	let message: string;
	let selectedDevice: Device;

	async function loadDevices() {
		devices = await getDevices($authenticationData?.did);
	}

	function updateLoading() {
		DEVICE_LIST_BUTTON = {
			icon: loading ? undefined : 'plus',
			onClick: handleCreateDevice,
			label: loading ? 'Creating device...' : 'Create device',
			loading,
			disabled: loading
		};
	}

	$: selectedDevice, updateState();
	$: message = devices?.length ? 'No devices found' : undefined;
	$: loading, updateLoading();

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

	async function handleCreateDevice() {
		loading = true;
		await createDevice();
		loadDevices();
		loading = false;
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
		<ListManager {tableData} {message} actionButtons={[DEVICE_LIST_BUTTON]} />
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
