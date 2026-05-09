<script lang="ts">
  
  export let size: string = '40px';
  export let color: string = '#3498db';
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
    height: 100%; 
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
