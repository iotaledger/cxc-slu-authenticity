import type { Device } from "./types";

export async function getDeviceNonce(deviceId: string, creatorId: string): Promise<Device> {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/slu-nonce/${deviceId}/${creatorId}/`, {
            headers: {
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
        })
        const slu = await response.json()
        return slu;
    }
    catch (e) {
        console.error("Failed to fetch nonce device info.", e)
        return {}
    }
}

export async function getDevices(creatorId: string): Promise<Device[]> {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/creator-devices/${creatorId}/`, {
            headers: {
                'X-API-KEY': import.meta.env.VITE_SLU_STATUS_API_KEY,
            },
        })
        const devices = await response.json()
        return devices;
    }
    catch (e) {
        console.error("Failed to fetch nonce device info.", e)
        return []
    }
}

export async function createDevice(channelAddress: string, creatorId: string): Promise<Device> {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/one-shot-device/create/${channelAddress}/${creatorId}/`)
        const device = await response.json()
        return device;
    }
    catch (e) {
        console.error("Failed to fetch nonce device info.", e)
        return {}
    }
}

