<script lang="ts">
	export let progress: number;
</script>

<progress value={progress} class="animated w-full" />

<style>
	progress {
		width: 100%;
		border: 0;
		height: 12px;
		overflow: hidden;
		opacity: 0.7;
	}
	.animated::-webkit-progress-value {
		transition: width 2.5s ease-in-out;
		background-color: blue;
	}
</style>
