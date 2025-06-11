<script>
  import { fly } from 'svelte/transition';
  import { quintOut, quintIn } from 'svelte/easing';
  import { onDestroy, createEventDispatcher } from 'svelte';
  
  export let type = 'info'; // 'success', 'warning', 'error', 'info'
  export let message = '';
  export let duration = 4000; // Auto hide duration in milliseconds
  export let position = 'bottom-center'; // 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'
  export let showIcon = true;
  export let closeable = true;

  const dispatch = createEventDispatcher();
  let timeoutId;

  // Central function to manage the alert's timer.
  // Called reactively when message or duration changes.
  function manageAlertTimer() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    // Only set a new timer if there's a message and a positive duration
    if (message && duration > 0) {
      timeoutId = setTimeout(() => {
        dispatch('hide'); // Signal parent to hide/unmount this component
      }, duration);
    }
  }

  // Reactive statement: re-evaluate and manage timer when message or duration changes.
  // Pass message and duration as arguments to the reactive statement to ensure it re-runs when they change.
  $: manageAlertTimer(message, duration);


  function handleManualClose() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    dispatch('hide');
  }

  // Get position classes
  function getPositionClasses(pos) {
    const positions = {
      'top-left': 'top-5 left-5',
      'top-center': 'top-5 left-1/2 transform -translate-x-1/2',
      'top-right': 'top-5 right-5',
      'bottom-left': 'bottom-5 left-5',
      'bottom-center': 'bottom-5 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-5 right-5'
    };
    return positions[pos] || positions['bottom-center'];
  }

  // Get type-specific styles
  function getTypeStyles(alertType) {
    const styles = {
      success: {
        bg: 'bg-green-500',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      warning: {
        bg: 'bg-yellow-500',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z'
      },
      error: {
        bg: 'bg-red-500',
        icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      info: {
        bg: 'bg-blue-500',
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      }
    };
    return styles[alertType] || styles.info;
  }

  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  $: typeStyle = getTypeStyles(type);
  $: positionClass = getPositionClasses(position);
</script>

{#key message} <!-- This key directive ensures re-animation when message content changes, even on an existing instance -->
    <div
      in:fly={{ y: position.includes('top') ? -50 : 50, duration: 300, easing: quintOut }}
      out:fly={{ y: position.includes('top') ? -100 : 100, duration: 250, easing: quintIn }}
      class="fixed {positionClass} max-w-sm w-full mx-auto p-4 rounded-lg shadow-lg text-white z-50 {typeStyle.bg}"
      role="alert"
      aria-live="assertive"
    >
      <div class="flex items-start">
        {#if showIcon}
          <div class="flex-shrink-0 mr-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{typeStyle.icon}"></path>
            </svg>
          </div>
        {/if}
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium leading-5">{message}</p>
        </div>
        
        {#if closeable}
          <div class="ml-3 flex-shrink-0">
            <button
              on:click={handleManualClose}
              class="inline-flex text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 transition-colors"
              aria-label="ปิด"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        {/if}
      </div>
    </div>
{/key}