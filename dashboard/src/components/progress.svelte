<script lang="ts">
	export let progress: number;
</script>

<progress value={progress} class="w-full" />

<style>
	progress {
		width: 100%;
		height: 20px;
	}
</style>
