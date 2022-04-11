import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export const progress: Writable<number> = writable(0)
