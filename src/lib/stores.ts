import { writable } from 'svelte/store';

export const level = writable<number>(0);
export const persistentRaysAvailable = writable<boolean>(false);
export const showingVirtualObjects = writable<boolean>(false);
export const inputDisabled = writable<boolean>(true);
export const canProceed = writable<boolean>(true);
export const currentTextIndex = writable<number>(0);
export const clearLevel = writable<boolean>(false);
