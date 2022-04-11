<script lang="ts">
	export let background: string;
</script>

<div class="progress bg-{background}">
	<div class="progress-bar" />
</div>

<style>
	.progress {
		width: 100%;
		height: 8px;
		overflow: hidden;
	}
	.progress-bar {
		width: 100%;
		height: 100%;
		background-color: rgb(228, 225, 225);
		animation: 5s progress ease-in-out infinite;
	}
	@keyframes progress {
		0% {
			transform: translate(0);
		}
		100% {
			transform: translate(100%);
		}
	}
</style>
