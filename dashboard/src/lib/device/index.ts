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
        const response = await fetch(`${import.meta.env.VITE_SLU_GATEWAY_URL}/api/v1/slu-nonce/${deviceId}/${creatorId}`, {
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
            message: 'The request for device nonce information failed',
        })
        console.error(Error, e);
        return ""
    }
}

export async function getDevices(creatorId: string): Promise<Device[]> {
    try {
        const response = await fetch(`${import.meta.env.VITE_SLU_GATEWAY_URL}/api/v1/creator-devices/${creatorId}`, {
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
            message: "The request to list devices failed.",
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
            const deviceResponse = await fetch(`${import.meta.env.VITE_SLU_GATEWAY_URL}/api/v1/one-shot-device/create/${channel?.channelAddress}/${get(authenticationData)?.did}`, {
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
    }
}

export async function getStatus(deviceId: string): Promise<string> {
    try {
        const statusResponse = await fetch(`${import.meta.env.VITE_SLU_GATEWAY_URL}/api/v1/status/${deviceId}`, {
            headers: {
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
        })

        return await statusResponse.text();
    }
    catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: "The request for device status failed",
        })
        console.error(Error, e);
        return "-"
    }
}

export async function isAuthenticDevice(deviceId: string): Promise<boolean> {
    try {
        // TODO: Change from and to parameters when we have this info
        const isAuthenticResponse = await fetch(`${import.meta.env.VITE_SLU_GATEWAY_URL}/api/v1/authenticity/prove?did=${deviceId}&from=2022-01-27&to=2022-01-28`, {
            headers: {
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
        })

        const isAuthentic = await isAuthenticResponse.json()

        return isAuthentic.length > 0;
    }
    catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: "The request for device status failed",
        })
        console.error(Error, e);
        return false
    }
}

export async function getDeviceDetails(deviceId: string, channelAddress: string): Promise<any> {
    try {
        const status = await getStatus(deviceId)
        const nonce = await getDeviceNonce(deviceId, get(authenticationData)?.did)
        const subscriptions = await getSubscriptions(channelAddress)
        const isAuthentic = await isAuthenticDevice(deviceId)
        return { status, nonce, subscriptions, isAuthentic }
    }
    catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: "The request for device details failed.",
        })
        console.error(Error, e);
        return {}
    }
}
