<script>
  import { page } from "$app/stores";
  import { onMount, onDestroy } from "svelte";
  import MasonryGallery from "$lib/component/MasonryGallery.svelte";
  import { errorAlert } from "$lib/alertUtils";
  import Loading from "$lib/component/Loading.svelte";
  $: query = $page.url.searchParams.get("q");

  const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;


  let goods = { hits: [], total: 0, error: null };
  let currentPage = 1;
  let loadingMore = false;
  let hasMore = true;
  let isLoading = false;

  async function fetchGoods(pageToFetch = 1) {
    if (!query) {

      goods = { hits: [], total: 0, error: null };
      currentPage = 1;
      hasMore = false;
      loadingMore = false;
      return;
    }
    if (loadingMore) return;

    loadingMore = true;
    if (pageToFetch === 1) {

      goods = { hits: [], total: 0, error: null };
    }
    goods.error = null;

    try {
      isLoading = true;
      const apiUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20&safesearch=true&page=${pageToFetch}`;
      const respond = await fetch(apiUrl);

      if (!respond.ok) {
        console.error(`HTTP error! status: ${respond.status}`);
        goods.error = `Failed to fetch: ${respond.statusText}`;
        hasMore = false;
        if (pageToFetch === 1) {
          goods.hits = [];
          goods.total = 0;
        }
        return;
      }

      const data = await respond.json();

      if (pageToFetch === 1) {
        goods.hits = data.hits || [];
        goods.total = data.totalHits || 0;
      } else {
        goods.hits = [...goods.hits, ...(data.hits || [])];

      }

      currentPage = pageToFetch;
      hasMore = goods.hits.length < goods.total;
      if (data.hits && data.hits.length === 0 && pageToFetch > 1) {
        hasMore = false;
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      goods.error = "An error occurred while fetching data.";
      if (pageToFetch === 1) {
        goods.hits = [];
        goods.total = 0;
      }
      hasMore = false;
    } finally {
      loadingMore = false;
      isLoading = false;
    }
  }


  $: {
    if (query) {
      currentPage = 1;
      hasMore = true;
      fetchGoods(1);
    } else {

      goods = { hits: [], total: 0, error: null };
      currentPage = 1;
      hasMore = false;
      loadingMore = false;
    }
  }


  async function handleScroll() {
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 350;

    if (nearBottom && !loadingMore && hasMore && query) {
      await fetchGoods(currentPage + 1);
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<div class="p-10">
  {#if isLoading}
    <Loading />
  {:else}
    <h1 class="text-4xl py-5">{goods.total} รูปภาพฟรีของ {query}</h1>
  {/if}
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
