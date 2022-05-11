import { SLU_API_BASE_URL } from '$lib/constants';
import {
    acceptSubscription, authenticationData, createChannel, getSubscriptions, NotificationType,
    searchIdentityByDID, showNotification
} from '@iota/is-ui-components';
import { get } from "svelte/store";
import { deviceCreationProgress } from './store';
import type { Device } from "./types";

export async function getDeviceNonce(deviceId: string, creatorId: string): Promise<string> {
    try {
        const response = await fetch(`${SLU_API_BASE_URL}/slu-nonce/${deviceId}/${creatorId}`, {
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
        const response = await fetch(`${SLU_API_BASE_URL}/creator-devices/${creatorId}`, {
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

export async function getStatuses(devices: Device[]): Promise<any>{
    const deviceIds: string[] = devices.map((device) => device.id);
    try {
        const response = await fetch(`${SLU_API_BASE_URL}/status/statuses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
            body: JSON.stringify({id: deviceIds})         
        })
        return await response.json();
    }
    catch (e) {
        showNotification({
            type: NotificationType.Error,
            message: "The request for the statuses failed",
        })
        console.error(Error, e);
        return "-"
    }

}

export async function createDevice(deviceName: string): Promise<void> {
    try {
        // Create a channel
        // Timeout to see progress bar animation (from 0 to 0.33)
        setTimeout(() => deviceCreationProgress.set(0.33), 100)
        const channel = await createChannel(`channel-${deviceName}`,'',[{ type: 'cxc', source: 'cxc' }]);
        // Create a device
        if (channel) {
            deviceCreationProgress.set(0.66)
            const deviceResponse = await fetch(`${SLU_API_BASE_URL}/one-shot-device/create/${channel?.channelAddress}/${get(authenticationData)?.did}/${deviceName}`, {
                method: 'POST',
            })
            const device = await deviceResponse.json()
            // Authorize device to created channel
            if (device) {
                deviceCreationProgress.set(1);
                await acceptSubscription(channel?.channelAddress, device?.id);
                deviceCreationProgress.set(0)
            }
        }
    }
    catch (e) {
        deviceCreationProgress.set(0)
        showNotification({
            type: NotificationType.Error,
            message: "The request to create a device failed.",
        })
        console.error(Error, e);
    }
}

export async function getStatus(deviceId: string): Promise<string> {
    try {
        const statusResponse = await fetch(`${SLU_API_BASE_URL}/status/${deviceId}`, {
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
        // We need search the identity details cause we need a "from" parameter to get the authenticity that is the created identity date and we don't have this info. TODO: Improve this.
        const identityDetails = await searchIdentityByDID(deviceId)
        const registrationDateAndTime = identityDetails?.registrationDate
        // Only get date but no time
        const registrationDate = registrationDateAndTime?.split('T')?.[0]
        const today = new Date().toISOString().split('T')[0]

        const isAuthenticResponse = await fetch(`${SLU_API_BASE_URL}/authenticity/prove?did=${deviceId}&from=${registrationDate}&to=${today}`, {
            headers: {
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
        })
        const isAuthentic = await isAuthenticResponse.json()
        return isAuthentic?.length > 0;
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