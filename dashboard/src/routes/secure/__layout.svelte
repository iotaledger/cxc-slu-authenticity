<script>
    import { goto } from "$app/navigation";
    import { isAuthenticated } from "@iota/is-ui-components";
   	$: {
    	if (!$isAuthenticated) {
			goto("/");
		}
	}
</script>

<slot></slot>