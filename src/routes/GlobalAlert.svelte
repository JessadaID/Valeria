<script>
  import { alertStore } from '$lib/alertUtils';
  import Alert from '$lib/component/floatAlert.svelte';
  
  // Subscribe to the alert store
  $: alert = $alertStore;
</script>

<!-- Global alert that responds to the store -->
{#if alert.visible}
  <Alert
    type={alert.type}
    message={alert.message}
    duration={alert.duration}
    position={alert.position}
    showIcon={alert.showIcon}
    closeable={alert.closeable}
    on:hide={() => alertStore.update(a => ({ ...a, visible: false, message: '' }))}
  />
{/if}