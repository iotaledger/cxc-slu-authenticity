<script lang="ts">
	export let progress: number = 0;
	export let delay: number = 10;
	export let progressColor: string = '#5caad0';
	export let backgroundColor: string = '#d541bd';
</script>

{#if progress <= 1}
	<progress
		value={progress}
		style="--delay:{delay}s; --bg-color:{backgroundColor}; --progress-color:{progressColor}"
		class="w-full"
	/>
{/if}

<style lang="scss">
	progress {
		width: 100%;
		border: 0;
		height: 8px;
		overflow: hidden;
		opacity: 0.7;
		&::-webkit-progress-value {
			transition: width var(--delay) ease-in-out;
			background-color: var(--bg-color);
		}
		&::-webkit-progress-bar {
			background-color: var(--progress-color);
		}
	}
</style>
