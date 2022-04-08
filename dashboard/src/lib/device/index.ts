import type { Device } from "./types";
import {
    acceptSubscription,
    createChannel,
    authenticationData,
    getSubscriptions,
    showNotification,
    NotificationType
} from '@iota/is-ui-components';
import { get } from "svelte/store";

export async function getDeviceNonce(deviceId: string, creatorId: string): Promise<string> {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/slu-nonce/${deviceId}/${creatorId}`, {
            headers: {
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
        })
        const slu = await response.json()
        return slu?.nonce;
    }
    catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: 'The request for nonce device information failed.',
        })
        console.error(Error, e);
        return ""
    }
}

export async function getDevices(creatorId: string): Promise<Device[]> {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/creator-devices/${creatorId}`, {
            headers: {
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
        })
        const devices = await response.json()
        return devices;
    }
    catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: "The request for list devices failed.",
        })
        console.error(Error, e);
        return []
    }
}

export async function createDevice(): Promise<void> {
    try {
        // Create a channel
        const channel = await createChannel([{ type: 'cxc', source: 'cxc' }]);
        // Create a device
        if (channel) {
            const deviceResponse = await fetch(`http://localhost:3000/api/v1/one-shot-device/create/${channel?.channelAddress}/${get(authenticationData)?.did}`, {
                method: 'POST',
            })
            const device = await deviceResponse.json()
            // Authorize device to created channel
            if (device) {
                await acceptSubscription(channel?.channelAddress, device?.id);
            }
        }
    }
    catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: "The request to create a device failed.",
        })
        console.error(Error, e);
        console.error("Failed to create device.", e)
    }
}

export async function getStatus(deviceId: string): Promise<string> {
    try {
        const statusResponse = await fetch(`http://localhost:3000/api/v1/status/${deviceId}`, {
            headers: {
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
        })

        return await statusResponse.text();
    }
    catch (e) {
        console.error("Failed to get status.", e)
        return "-"
    }
}

export async function getDeviceDetails(deviceId: string, channelAddress: string): Promise<any> {
    try {
        const status = await getStatus(deviceId)
        const nonce = await getDeviceNonce(deviceId, get(authenticationData)?.did)
        const subscriptions = await getSubscriptions(channelAddress)
        return { status, nonce, subscriptions }
    }
    catch (e) {
        console.error("Failed to get status.", e)
        return {}
    }
}
