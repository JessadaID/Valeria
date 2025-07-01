<script>
  import { onMount, onDestroy } from "svelte";
  import MasonryGallery from "$lib/component/MasonryGallery.svelte";


  const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

  // Initialize goods with a structure that the template expects
  let goods = { hits: [], total: 0, error: null };
  let currentPage = 1;
  let loadingMore = false;
  let hasMore = true; // Assume there might be more initially

  async function fetchGoods(pageToFetch = 1) {
    if (loadingMore) return; // Prevent multiple simultaneous fetches

    loadingMore = true;
    goods.error = null; // Clear previous errors

    try {
      const params = new URLSearchParams({
        key: PIXABAY_API_KEY,
        image_type: 'illustration',
        safesearch: 'true',
        page: String(pageToFetch),
        per_page: '20'
      });
      const apiUrl = `https://pixabay.com/api/?${params.toString()}`;
      const respond = await fetch(apiUrl);

      if (!respond.ok) {
        throw new Error(`Failed to fetch: ${respond.statusText}`);
      }

      const data = await respond.json();

      if (pageToFetch === 1) {
        goods.hits = data.hits || [];
        goods.total = data.totalHits || 0; // Use totalHits for pagination limit
      } else {
        goods.hits = [...goods.hits, ...(data.hits || [])];
      }
      
      currentPage = pageToFetch;
      hasMore = goods.hits.length < goods.total;

    } catch (error) {
      console.error("Error fetching photo results:", error);
      goods.error = error.message || "An error occurred while fetching data.";
      hasMore = false; // Stop trying on error
    } finally {
      loadingMore = false;
    }
  }


  // Scroll handler to load more goods
  async function handleScroll() {
    const nearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 350; // 350px threshold

    if (nearBottom && !loadingMore && hasMore) {
      await fetchGoods(currentPage + 1);
    }
  }

  onMount(() => {
    fetchGoods(1); // Fetch initial data
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="p-10">
    <h1 class="text-4xl py-5">{goods.total} รูปภาพฟรี</h1>
  {#if goods.error}
    <p class="text-red-500">Error: {goods.error}</p>
  {/if}
  <MasonryGallery goods={goods.hits} />
  {#if loadingMore && currentPage > 1}
    <p class="text-center py-5">กำลังโหลดเพิ่มเติม...</p>
  {/if}
  {#if !hasMore  && goods.hits.length > 0}
    <p class="text-center py-5 text-gray-500">-- สิ้นสุดผลการค้นหา --</p>
  {/if}
</div>
