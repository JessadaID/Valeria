<script>
  import { alertStore } from '$lib/alertUtils';
  import Alert from '$lib/component/floatAlert.svelte';
  
  // Subscribe to the alert store
  $: alerts = $alertStore;
  
  // Handle alert hide event
  function handleAlertHide(event, alertId) {
    // Remove the alert from store
    alertStore.update(alerts => alerts.filter(alert => alert.id !== alertId));
  }
  
  // Group alerts by position for proper stacking
  function getAlertsByPosition(position) {
    return alerts.filter(alert => alert.position === position && alert.visible);
  }
  
  // Get unique positions from current alerts
  $: positions = [...new Set(alerts.filter(alert => alert.visible).map(alert => alert.position))];
  
  // Calculate dynamic positioning for stacked alerts
  function getDynamicStyle(alert, alertsInPosition) {
    const alertIndex = alertsInPosition.findIndex(a => a.id === alert.id);
    const offsetPerAlert = 80; // Height + margin for each alert
    const isTop = alert.position.includes('top');
    
    let offset;
    if (isTop) {
      // For top positions, newer alerts appear below older ones
      offset = alertIndex * offsetPerAlert;
      return `top: ${20 + offset}px;`;
    } else {
      // For bottom positions, newer alerts appear above older ones
      offset = (alertsInPosition.length - 1 - alertIndex) * offsetPerAlert;
      return `bottom: ${20 + offset}px;`;
    }
  }
  
  // Get position classes for container positioning
  function getPositionClasses(pos) {
    const positions = {
      'top-left': 'left-5',
      'top-center': 'left-1/2 transform -translate-x-1/2',
      'top-right': 'right-5',
      'bottom-left': 'left-5',
      'bottom-center': 'left-1/2 transform -translate-x-1/2',
      'bottom-right': 'right-5'
    };
    return positions[pos] || positions['bottom-center'];
  }
</script>

<!-- Render alerts grouped by position -->
{#each positions as position}
  {@const alertsInPosition = getAlertsByPosition(position)}
  {#each alertsInPosition as alert (alert.id)}
    <div
      class="fixed {getPositionClasses(position)} max-w-sm w-full mx-auto z-50"
      style="{getDynamicStyle(alert, alertsInPosition)}"
    >
      <Alert
        id={alert.id}
        type={alert.type}
        message={alert.message}
        duration={alert.duration}
        position={alert.position}
        showIcon={alert.showIcon}
        closeable={alert.closeable}
        on:hide={() => handleAlertHide(event, alert.id)}
      />
    </div>
  {/each}
{/each}