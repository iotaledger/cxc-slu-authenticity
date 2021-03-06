<script lang="ts">
	import { createDevice, getDevices, getStatuses } from '$lib';
	import { deviceCreationProgress } from '$lib/store';
	import type { Device } from '$lib/types';
	import {
		authenticationData,
		Icon,
		ListManager,
		type ActionButton,
		type TableData
	} from '@iota/is-ui-components';
	import { onMount } from 'svelte';
	import { Container, Row } from 'sveltestrap';
	import { DeviceDetails, ProgressBar, DeviceName } from '../components';

	enum State {
		ListDevices = 'listDevices',
		DeviceDetails = 'deviceDetails'
	}

	let loading: boolean = false;
	let state: State = State.ListDevices;
	let message: string;
	let selectedDevice: Device;
	let query: string;
	let searchResults: Device[] = [];
	let creatorDevices: Device[] = [];
	let createDeviceButton: ActionButton;

	let deviceName = '';
	let isDeviceNameDialogOpen = false;

	$: createDeviceButton = {
		onClick: () => (isDeviceNameDialogOpen = true),
		icon: 'plus',
		color: 'dark',
		label: loading ? 'Creating device...' : 'Create device',
		loading,
		disabled: loading
	};
	$: selectedDevice, updateState();
	$: message = 'No devices found';
	$: query, onSearch();
	$: tableData = {
		headings: ['Device Name', 'Related channel', 'Status'],
		rows: searchResults.map((device) => ({
			onClick: () => handleSelectDevice(device),
			content: [
				{
					icon: 'person-badge',
					boxColor: 'transparent',
					value: device.name ?? '-'
				},
				{
					value: device.channelName ?? '-'
				},
				{
					value: device.status ?? '-'
				}
			]
		}))
	} as TableData;

	onMount(async () => {
		await loadDevices();
	});

	async function loadDevices() {
		creatorDevices = await getDevices($authenticationData?.did);
		const devicesWithStatus = await getStatuses(creatorDevices);
		creatorDevices = addStatusToDevices(creatorDevices, devicesWithStatus);
		searchResults = creatorDevices;
	}

	function addStatusToDevices(
		devices: Device[],
		devicesWithStatus: { id: string; status: string }[]
	) {
		return devices.map((device) => {
			return {
				...device,
				status: devicesWithStatus.find((status) => status.id === device.id)?.status || undefined
			};
		});
	}

	function updateState(): void {
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
		isDeviceNameDialogOpen = false;
		loading = true;
		await createDevice(deviceName);	
		await loadDevices();
		loading = false;
		deviceName = '';
	}

	function handleBackClick(): void {
		selectedDevice = null;
	}

	function onSearch() {
			if (query?.includes('did:iota')) {
				searchResults = creatorDevices.filter((d) => d.id?.includes(query));
			} else {searchResults = creatorDevices.filter((d) => d.name?.includes(query))};
	}
</script>

<Container class="relative">
	<Row class="mb-4">
		<h1 class="text-center">Dashboard of IoT devices</h1>
	</Row>
	{#if state === State.ListDevices}
		<ListManager
			showSearch
			title="My devices"
			{tableData}
			{message}
			actionButtons={[createDeviceButton]}
			bind:searchQuery={query}
		/>
		<DeviceName
			bind:isOpen={isDeviceNameDialogOpen}
			bind:value={deviceName}
			onClick={() => handleCreateDevice()}
		/>
		{#if loading}
			<div class="progressbar-wrapper">
				<ProgressBar progress={$deviceCreationProgress} />
			</div>
		{/if}
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

<style lang="scss">
	:global(.btn:hover) {
		background-color: #1dc9d3;
		border-color: #1dc9d3;
		color: white;
	}
	.progressbar-wrapper {
		position: fixed;
		bottom: -6px;
		left: 0;
		width: 100%;
		z-index: 1;
	}
</style>
