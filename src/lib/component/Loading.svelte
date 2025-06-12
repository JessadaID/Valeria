<script lang="ts">
  /**
   * @description
   * This component displays a simple, clean, and elegant loading spinner.
   * It can be used anywhere in your Svelte application to indicate a loading state.
   *
   * @props
   * - `size`: string (optional) - The size of the spinner (e.g., '50px', '3rem'). Defaults to '40px'.
   * - `color`: string (optional) - The color of the spinner. Defaults to '#3498db' (a nice blue).
   * - `thickness`: string (optional) - The thickness of the spinner's border. Defaults to '4px'.
   * - `speed`: string (optional) - The speed of the animation. Defaults to '0.8s'.
   * - `ariaLabel`: string (optional) - ARIA label for accessibility. Defaults to 'Loading...'.
   */
  export let size: string = '40px';
  export let color: string = '#3498db'; // A pleasant blue
  export let thickness: string = '4px';
  export let speed: string = '0.8s';
  export let ariaLabel: string = 'Loading...';
</script>

<div
  class="loading-spinner-container"
  role="status"
  aria-live="polite"
  aria-label={ariaLabel}
>
  <div
    class="spinner"
    style:width={size}
    style:height={size}
    style:border-top-color={color}
    style:border-left-color={color}
    style:border-right-color="transparent"
    style:border-bottom-color="transparent"
    style:border-width={thickness}
    style:animation-duration={speed}
  ></div>
</div>

<style>
  .loading-spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%; /* Adjust as needed, or make it part of the parent's layout */
  }

  .spinner {
    border-style: solid;
    border-radius: 50%;
    animation-name: spin;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
