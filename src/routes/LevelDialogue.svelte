<script lang="ts">
	import {
		level,
		currentTextIndex,
		canProceed,
		inputDisabled,
		showingVirtualObjects
	} from '$lib/stores';
	import { fade } from 'svelte/transition';
	const levelText: string[][] = [
		['Objects in the world are constantly emitting light rays in every direction'],
		[
			'Some of those light rays make it to our eyes, allowing us to see things.',
			'Click and drag the Apple to cast a light ray from the candy to the eye.'
		],
		[
			'Light rays can bounce off of reflective objects, like mirrors.',
			'When this happens, we see a virtual object "inside" the mirror.',
			'To the viewer, these virtual objects always appear EXACTLTY as far away as the light ray traveled from the source.',
			'In other words, the light ray always travels the same distance, whether in the real world or the virtual world.'
		],
		[
			"It's even possible to see multiple virtual objects at once, if the light rays take multiple paths to the eye."
		],
		[
			'The number of bounces a light ray makes can affect how and where we see the virtual objects.',
			'Notice how the more bounces a light ray makes, the farther away the virtual object appears.',
			'However many unique paths a light ray can take, that is how many virtual objects we can see.'
		],
		[
			'Now that you understand the basics, you can experiment on your own! In this scene, you can click and drag empty space to create new mirrors!',
			'Experiment with different angles, placements, and numbers of mirrors to see how the virtual objects change!',
			''
		]
	];

	const blockingLevels: number[][] = [[], [1], [0], [0], [0], [3]];
	const inputDisableLevels: number[][] = [[0], [], [], [], [], []];
	const inputEnableLevels: number[][] = [[], [1], [], [], [], []];
	let hideDialogue = false;
	const proceed = () => {
		if (!$canProceed) return;
		if ($currentTextIndex < levelText[$level].length - 1) {
			$currentTextIndex++;
		} else {
			$level++;
			$currentTextIndex = 0;
			$showingVirtualObjects = false;
		}
		if (blockingLevels[$level].includes($currentTextIndex)) {
			$canProceed = false;
		}
		if (inputDisableLevels[$level].includes($currentTextIndex)) {
			$inputDisabled = true;
		}
		if (inputEnableLevels[$level].includes($currentTextIndex)) {
			$inputDisabled = false;
		}
		if ($level === 5 && $currentTextIndex === 2) {
			hideDialogue = true;
		}
	};
</script>

{#if !hideDialogue}
	<div class="w-full h-full flex items-center justify-center p-5 space-x-5">
		<div class="variant-ghost h-full w-5/6 rounded-2xl flex items-center justify-center">
			<h3 transition:fade class="h3 w-2/3 text-center">
				{levelText[$level][$currentTextIndex]}
			</h3>
		</div>
		<button
			on:pointerdown|preventDefault={proceed}
			disabled={!$canProceed}
			class:invisible={!$canProceed}
			class="block h-full w-40 variant-filled rounded-2xl pointer-events-auto"
		>
			<span class="animate-bounce"> Continue </span>
		</button>
	</div>
{/if}
