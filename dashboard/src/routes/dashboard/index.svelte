<script lang="ts">
	import { isAuthenticated } from '@iota/is-ui-components';
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';
	import type { ActionButton, TableData } from '@iota/is-ui-components';
	import {
		ChannelMessages,
		Icon,
		IdentityDetails,
		isAsyncLoadingIdentities,
		ListManager,
		NotificationManager,
		searchIdentitiesResults,
		selectedChannelData,
		selectedIdentity,
		startReadingChannel,
		stopReadingChannel
	} from '@iota/is-ui-components';
	import { Container, Row } from 'sveltestrap';

	$: {
		if (browser && !$isAuthenticated) {
			goto('/');
		}
	}

	const IDENTITY_LIST_BUTTONS: ActionButton[] = [
		{
			label: 'Add device',
			onClick: addNewDevice,
			icon: 'plus',
			color: 'dark'
		}
	];

	const TARGET_CHANNEL_ADDRESS =
		'db9660525ebf0970884da7d515f3337acd1eab48d7e1d37c1fe304bd192343c00000000000000000:bd1cb41465914401880f28e4';

	enum State {
		ListDevices = 'listDevices',
		DeviceDetail = 'deviceDetail'
	}

	let devices = ['one device'];
	let state: State = State.ListDevices;
	let loading: boolean = false;
	let query: string = '';
	let message: string;

	$: $selectedIdentity, updateState();
	$: state;
	$: message =
		$isAsyncLoadingIdentities || loading || $searchIdentitiesResults?.length
			? null
			: 'No devices found';

	$: tableData = {
		headings: ['Device'],
		rows: devices.map((device) => ({
			onClick: () => handleSelectIdentity(device),
			content: [
				{
					icon: 'nut',
					boxColor: 'green',
					value: device
				}
			]
		}))
	} as TableData;

	async function updateState(): Promise<void> {
		if ($selectedIdentity) {
			state = State.DeviceDetail;
			// custom: start reading channel data
			startReadingChannel(TARGET_CHANNEL_ADDRESS);
		} else {
			state = State.ListDevices;
			stopReadingChannel();
		}
	}

	function handleSelectIdentity(device): void {
		selectedIdentity.set(device);
	}

	function addNewDevice() {
		let newDevices = [...devices, 'new device'];
		devices = newDevices;
	}

	function handleBackClick(): void {
		selectedIdentity.set(null);
	}
</script>

<Container class="py-5">
	<Row class="mb-4">
		<h1>Device Manager</h1>
	</Row>
	{#if state === State.ListDevices}
		<ListManager
			showSearch
			{tableData}
			{message}
			loading={loading || $isAsyncLoadingIdentities}
			actionButtons={IDENTITY_LIST_BUTTONS}
			bind:searchQuery={query}
		/>
	{:else if state === State.DeviceDetail}
		<div class="mb-4 align-self-start">
			<button on:click={handleBackClick} class="btn d-flex align-items-center">
				<Icon type="arrow-left" size={16} />
				<span class="ms-2">Back</span>
			</button>
		</div>
		<IdentityDetails {loading} identity={$selectedIdentity} />
		<div class="mb-4">
			<ChannelMessages channelData={$selectedChannelData} />
		</div>
	{/if}
</Container>

<NotificationManager />
