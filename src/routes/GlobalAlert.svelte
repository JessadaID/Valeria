<script>
  import { alertStore } from "$lib/alertUtils";
  import Alert from "$lib/component/floatAlert.svelte";

  $: alerts = $alertStore;

  function handleAlertHide(event, alertId) {
    alertStore.update((alerts) =>
      alerts.filter((alert) => alert.id !== alertId),
    );
  }

  function getAlertsByPosition(position) {
    return alerts.filter(
      (alert) => alert.position === position && alert.visible,
    );
  }

  $: positions = [
    ...new Set(
      alerts.filter((alert) => alert.visible).map((alert) => alert.position),
    ),
  ];

  function getDynamicStyle(alert, alertsInPosition) {
    const alertIndex = alertsInPosition.findIndex((a) => a.id === alert.id);
    const offsetPerAlert = 80;
    const isTop = alert.position.includes("top");

    let offset;
    if (isTop) {
      offset = alertIndex * offsetPerAlert;
      return `top: ${20 + offset}px;`;
    } else {
      offset = (alertsInPosition.length - 1 - alertIndex) * offsetPerAlert;
      return `bottom: ${20 + offset}px;`;
    }
  }

  function getPositionClasses(pos) {
    const positions = {
      "top-left": "left-5",
      "top-center": "left-1/2 transform -translate-x-1/2",
      "top-right": "right-5",
      "bottom-left": "left-5",
      "bottom-center": "left-1/2 transform -translate-x-1/2",
      "bottom-right": "right-5",
    };
    return positions[pos] || positions["bottom-center"];
  }
</script>

{#each positions as position}
  {@const alertsInPosition = getAlertsByPosition(position)}
  {#each alertsInPosition as alert (alert.id)}
    <div
      class="fixed {getPositionClasses(position)} max-w-sm w-full mx-auto z-50"
      style={getDynamicStyle(alert, alertsInPosition)}
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
