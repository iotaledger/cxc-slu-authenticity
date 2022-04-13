import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export const deviceCreationProgress: Writable<number> = writable(0)
