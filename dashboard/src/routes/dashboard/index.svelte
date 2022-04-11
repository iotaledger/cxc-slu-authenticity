<script lang="ts">
	import { createDevice, getDevices } from '$lib/device';
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
	import { DeviceDetails } from '../../components';

	enum State {
		ListDevices = 'listDevices',
		DeviceDetails = 'deviceDetails'
	}

	let devices = [];
	let loading: boolean = false;
	let state: State = State.ListDevices;
	let message: string;
	let selectedDevice: Device;
	let query: string;
	let searchResults: Device[] = [];
	let CREATE_DEVICE_BUTTON: ActionButton = {
		label: 'Create device',
		onClick: handleCreateDevice,
		icon: 'plus',
		color: 'dark'
	};

	onMount(async () => {
		await loadDevices();
	});

	async function loadDevices() {
		devices = await getDevices($authenticationData?.did);
		searchResults = devices;
	}

	function updateLoading(): void {
		CREATE_DEVICE_BUTTON = {
			icon: loading ? undefined : 'plus',
			onClick: handleCreateDevice,
			label: loading ? 'Creating device...' : 'Create device',
			loading,
			disabled: loading
		};
	}

	async function updateState(): Promise<void> {
		if (selectedDevice) {
			state = State.DeviceDetails;
		} else {
			state = State.ListDevices;
		}
	}

	function handleSelectDevice(device: Device): void {
		selectedDevice = device;
	}

	async function handleCreateDevice(): Promise<void> {
		loading = true;
		await createDevice();
		loadDevices();
		loading = false;
	}

	function handleBackClick(): void {
		selectedDevice = null;
	}

	function onSearch() {
		searchResults = devices.filter((d) => d.id?.includes(query));
	}

	$: selectedDevice, updateState();
	$: message = 'No devices found';
	$: loading, updateLoading();
	$: query, onSearch();

	$: tableData = {
		headings: ['Device Id', 'Related channel'],
		rows: searchResults.map((device) => ({
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
</script>

<Container class="py-5">
	<Row class="mb-4">
		<h1 class="text-center">Dashboard of IoT devices</h1>
	</Row>
	{#if state === State.ListDevices}
		<ListManager
			showSearch
			title="My devices"
			{tableData}
			{message}
			actionButtons={[CREATE_DEVICE_BUTTON]}
			bind:searchQuery={query}
		/>
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
