<script lang="ts">
	import {
		canProceed,
		clearLevel,
		currentTextIndex,
		level,
		persistentRaysAvailable,
		showingVirtualObjects
	} from '$lib/stores';
	import { fade } from 'svelte/transition';
	import LevelDialogue from './LevelDialogue.svelte';

	const showVirtualObjectsButton = () => {
		$showingVirtualObjects = !$showingVirtualObjects;
		if ($showingVirtualObjects && $level === 2 && !$canProceed) {
			$canProceed = true;
			$currentTextIndex++;
		}
	};
</script>

<div class="w-full h-full relative">
	{#if $persistentRaysAvailable && $level > 1}
		<div transition:fade class="absolute top-7 right-7">
			<button
				on:pointerdown|preventDefault={showVirtualObjectsButton}
				class="btn btn-xl pointer-events-auto"
				class:variant-filled={!$showingVirtualObjects}
				class:variant-filled-error={$showingVirtualObjects}
			>
				{#if $showingVirtualObjects}
					Hide
				{:else}
					Show
				{/if}
				virtual objects</button
			>
		</div>
	{/if}
	{#if $level === 5}
		<div transition:fade class="absolute top-10 left-7">
			<button
				on:pointerdown|preventDefault={() => ($clearLevel = true)}
				class="btn pointer-events-auto variant-filled-primary"
			>
				Clear level</button
			>
		</div>
	{/if}
	<div class="absolute w-full h-1/4 bottom-6">
		<LevelDialogue />
	</div>
</div>
