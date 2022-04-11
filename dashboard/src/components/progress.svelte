<script lang="ts">
	export let progress;
</script>

<progress value={progress} class="w-full" />

<style>
	progress {
		width: 100%;
		height: 20px;
	}
</style>
