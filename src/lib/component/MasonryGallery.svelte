<script>
  import { onMount, onDestroy, tick } from 'svelte';

  export let goods = [];
  let galleryContainer;
  let resizeTimeout;
  let layoutTimeout;

  // Debounced version of initMasonryLayout
  function scheduleLayoutRecalculation() {
    clearTimeout(layoutTimeout);
    layoutTimeout = setTimeout(async () => {
      await tick(); // Ensure DOM is updated before layout calculation
      initMasonryLayout();
    }, 60); // Adjusted debounce time slightly
  }

  function getColumnCount() {
    if (typeof window === 'undefined') return 3; // Default for SSR or non-browser
    const width = window.innerWidth;
    if (width >= 1280) return 4; // xl
    if (width >= 1024) return 3; // lg (matches typical grid behavior better)
    if (width >= 768) return 3;  // md
    if (width >= 640) return 2;  // sm
    return 1;                     // xs
  }

  function initMasonryLayout() {
    if (!galleryContainer) return;

    const items = Array.from(galleryContainer.querySelectorAll('.masonry-item'));

    // If on small screens where CSS handles layout (flex column), reset JS styles and bail
    if (typeof window !== 'undefined' && window.innerWidth <= 640) {
      galleryContainer.style.height = 'auto';
      items.forEach(item => {
        item.style.position = 'relative';
        item.style.left = 'auto';
        item.style.top = 'auto';
        item.style.width = '100%'; // Let CSS handle width via class or default
      });
      return;
    }
    
    if (items.length === 0) {
      galleryContainer.style.height = '0px';
      return;
    }

    const gap = 20; // This gap is used for vertical spacing in JS calculation
    const columns = getColumnCount();
    const columnHeights = new Array(columns).fill(0);

    items.forEach(item => {
      const itemHeight = item.offsetHeight; // Actual height of the item
      if (itemHeight === 0) return; // Skip if item not rendered or image not loaded

      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      item.style.position = 'absolute';
      item.style.left = `${shortestColumnIndex * (100 / columns)}%`;
      item.style.top = `${columnHeights[shortestColumnIndex]}px`;
      item.style.width = `calc(${(100 / columns)}% - ${gap * (columns - 1) / columns}px)`;
      
      // The original code added itemHeight + gap.
      // The item itself has mb-5 (1.25rem ~ 20px).
      // If 'gap' is also 20, this means 20px from JS + 20px from margin.
      // To maintain original behavior, we keep it.
      columnHeights[shortestColumnIndex] += itemHeight + gap;
    });

    const maxHeight = Math.max(...columnHeights);
    galleryContainer.style.height = `${maxHeight}px`;
  }

  function handleImageLoad() {
    scheduleLayoutRecalculation();
  }

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      scheduleLayoutRecalculation();
    }, 250);
  }

  onMount(() => {
    scheduleLayoutRecalculation(); // Initial layout
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
      clearTimeout(resizeTimeout);
      clearTimeout(layoutTimeout);
    };
  });

  // Recalculate layout if the goods array changes
  $: if (goods && galleryContainer) {
    scheduleLayoutRecalculation();
  }

  function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      const val = num / 1000;
      return val.toFixed(val % 1 === 0 ? 0 : 1) + 'K';
    }
    return num.toString();
  }
</script>

<div bind:this={galleryContainer} class="masonry-container relative">
  {#each goods as good (good.id)}
    <div class="masonry-item mb-5">
      <div class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="relative overflow-hidden">
          <img
            src={good.webformatURL}
            alt={good.tags}
            class="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
            on:load={handleImageLoad}
            loading="lazy"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex gap-3">
              <button class="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full flex items-center justify-center hover:bg-white transition-colors" aria-label="Download">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
              <button class="w-10 h-10 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors" aria-label="Like">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {good.type}
            </span>
            <span class="text-xs text-gray-500">
              {good.imageWidth} × {good.imageHeight}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <span class="flex items-center gap-1" title="Downloads"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>{formatNumber(good.downloads)}</span>
              <span class="flex items-center gap-1" title="Likes"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>{formatNumber(good.likes)}</span>
              <span class="flex items-center gap-1" title="Views"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>{formatNumber(good.views)}</span>
            </div>
            <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">ฟรี</span>
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .masonry-container {
    position: relative;
  }
  
  .masonry-item {
    transition: top 0.3s ease, left 0.3s ease, width 0.3s ease; /* Smooth transition for item repositioning */
  }
  
  /* Responsive adjustments for small screens (handled by CSS flex) */
  @media (max-width: 640px) {
    .masonry-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem; /* Corresponds to mb-5 on items */
      height: auto !important; /* Override JS height */
    }
    .masonry-item {
      width: 100% !important;
      position: relative !important; /* Override JS absolute positioning */
      left: auto !important;
      top: auto !important;
      margin-bottom: 0; /* Gap is handled by flex container */
    }
    /* If masonry-item had mb-5, it might conflict with flex gap.
       The flex 'gap' property is preferred for small screens.
       The JS logic for masonry-item mb-5 is for larger screens.
       The current setup has mb-5 on items, and flex gap on container.
       It's better to have one source of truth for gap on small screens.
       Let's ensure mb-5 is not applied when flex is active or remove it if flex gap is used.
       For simplicity, the current CSS uses flex gap, so JS should not apply mb-5 related logic for small screens.
       The JS already bails out for small screens, so mb-5 on items will apply from Tailwind.
       The flex container `gap: 1.25rem` will correctly space items.
    */
  }
</style>