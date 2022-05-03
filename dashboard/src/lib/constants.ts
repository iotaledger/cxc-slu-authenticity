export enum ApiVersion {
    v1 = "v1"
}

const VERSION: ApiVersion = ApiVersion.v1

export const SLU_API_BASE_URL = `${import.meta.env.VITE_SLU_GATEWAY_URL}/api/${VERSION}`