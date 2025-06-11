<script>
  import { page } from "$app/stores"; // แก้ไข: import จาก $app/stores แทน $app/state
  import { onMount, onDestroy } from "svelte";
  import MasonryGallery from "$lib/component/MasonryGallery.svelte";

  // $: ทำให้ query อัปเดตอัตโนมัติเมื่อ $page.url.searchParams เปลี่ยนแปลง
  $: query = $page.url.searchParams.get('q'); 

  const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

  // Initialize goods with a structure that the template expects
  let goods = { hits: [], total: 0, error: null };
  let currentPage = 1;
  let loadingMore = false;
  let hasMore = true; // Assume there might be more initially

  async function fetchGoods(pageToFetch = 1) {
    if (!query) { // Don't fetch if there's no query
      goods = { hits: [], total: 0, error: null };
      currentPage = 1;
      hasMore = false;
      loadingMore = false;
      return;
    }
    if (loadingMore) return; // Prevent multiple simultaneous fetches

    loadingMore = true;
    if (pageToFetch === 1) { // For a new query or initial load
      goods = { hits: [], total: 0, error: null }; // Reset goods for new search
    }
    goods.error = null; // Clear previous errors for the current attempt

    try {
      const apiUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20&safesearch=true&page=${pageToFetch}`;
      const respond = await fetch(apiUrl);

      if (!respond.ok) {
        console.error(`HTTP error! status: ${respond.status}`);
        goods.error = `Failed to fetch: ${respond.statusText}`;
        hasMore = false; // Stop trying to load more on error
        if (pageToFetch === 1) {
            goods.hits = [];
            goods.total = 0;
        }
        return;
      }

      const data = await respond.json();

      if (pageToFetch === 1) {
        goods.hits = data.hits || [];
        goods.total = data.totalHits || 0; // Use totalHits for pagination limit
      } else {
        goods.hits = [...goods.hits, ...(data.hits || [])];
        // goods.total (totalHits) remains the same from the first fetch
      }
      
      currentPage = pageToFetch;
      hasMore = goods.hits.length < goods.total;
      if (data.hits && data.hits.length === 0 && pageToFetch > 1) {
          hasMore = false; // API returned no new hits for this page
      }

    } catch (error) {
      console.error("Error fetching search results:", error);
      goods.error = "An error occurred while fetching data.";
      if (pageToFetch === 1) {
          goods.hits = [];
          goods.total = 0;
      }
      hasMore = false; // Stop trying on catch
    } finally {
      loadingMore = false;
    }
  }

  // Reactive statement to fetch data when query changes
  $: {
    if (query) {
      currentPage = 1; // Reset page for new query
      hasMore = true;    // Assume new query might have more results
      fetchGoods(1);   // Fetch first page for the new query
    } else {
      // Reset goods if there is no query
      goods = { hits: [], total: 0, error: null };
      currentPage = 1;
      hasMore = false;
      loadingMore = false;
    }
  }

  // Scroll handler to load more goods
  async function handleScroll() {
    const nearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 350; // 300px threshold

    if (nearBottom && !loadingMore && hasMore && query) {
      await fetchGoods(currentPage + 1);
    }
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="p-10">
    <h1 class="text-4xl py-5">{goods.total} รูปภาพฟรีของ {query}</h1>
  {#if goods.error}
    <p class="text-red-500">Error: {goods.error}</p>
  {/if}
  <MasonryGallery goods={goods.hits} />
  {#if loadingMore && currentPage > 1}
    <p class="text-center py-5">กำลังโหลดเพิ่มเติม...</p>
  {/if}
  {#if !hasMore && query && goods.hits.length > 0}
    <p class="text-center py-5 text-gray-500">-- สิ้นสุดผลการค้นหา --</p>
  {/if}
</div>
