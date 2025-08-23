<script>
  import Loading from "$lib/component/Loading.svelte";
  import { supabase } from "$lib/supabaseClient";
  import { onMount, tick } from "svelte";

  import MediaItem from "./MediaItem.svelte";
  import MediaTabs from "./MediaTabs.svelte"; // ตรวจสอบพาธให้ถูกต้อง

  const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

  let allMediaItems = [];
  let displayedMedia = [];
  let loading = false;
  let currentUser = null;
  let galleryContainer;
  let resizeTimeout;
  let layoutTimeout;
  let selectedMediaType = "image"; // Default เป็น 'image'

  function scheduleLayoutRecalculation() {
    clearTimeout(layoutTimeout);
    layoutTimeout = setTimeout(async () => {
      await tick();
      initMasonryLayout();
    }, 60);
  }

  function getColumnCount() {
    if (typeof window === "undefined") return 3;
    const width = window.innerWidth;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 768) return 3;
    if (width >= 640) return 2;
    return 1;
  }

  function initMasonryLayout() {
    if (!galleryContainer) return;

    const items = Array.from(
      galleryContainer.querySelectorAll(".masonry-item")
    );

    if (typeof window !== "undefined" && window.innerWidth <= 640) {
      galleryContainer.style.height = "auto";
      items.forEach((item) => {
        item.style.position = "relative";
        item.style.left = "auto";
        item.style.top = "auto";
        item.style.width = "100%";
      });
      return;
    }

    if (items.length === 0) {
      galleryContainer.style.height = "0px";
      return;
    }

    const gap = 20;
    const columns = getColumnCount();
    const columnHeights = new Array(columns).fill(0);

    items.forEach((item) => {
      const itemHeight = item.offsetHeight;
      if (itemHeight === 0) return;

      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights)
      );

      item.style.position = "absolute";
      item.style.left = `${shortestColumnIndex * (100 / columns)}%`;
      item.style.top = `${columnHeights[shortestColumnIndex]}px`;
      item.style.width = `calc(${100 / columns}% - ${(gap * (columns - 1)) / columns}px)`;

      columnHeights[shortestColumnIndex] += itemHeight + gap;
    });

    const maxHeight = Math.max(...columnHeights);
    galleryContainer.style.height = `${maxHeight}px`;
  }

  function handleMediaItemLoad() {
    scheduleLayoutRecalculation();
  }

  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      scheduleLayoutRecalculation();
    }, 250);
  }

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUser = user;
  }

  async function fetchOrders() {
    loading = true;
    allMediaItems = [];

    await checkUser();
    if (!currentUser) {
      loading = false;
      return;
    }

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", currentUser.id);

      if (orderError) {
        throw orderError;
      }

      if (orderData && orderData.length > 0) {
        const orderItems = orderData.flatMap((order) => order.order_items);

        const processedItems = await Promise.all(
          orderItems.map(async (item) => {
            // *** การเปลี่ยนแปลงตรงนี้: แปลง type ให้เป็น 'image' ถ้าเข้าเงื่อนไข ***
            let mediaType = item.type;
            if (
              ["all", "photo", "illustration", "vector"].includes(mediaType)
            ) {
              mediaType = "image";
            }
            // ***************************************************************
            //console.log("Processing item:", item);
            const pixabayId = item.image_id;

            if (!pixabayId || !mediaType) {
              console.warn("Item missing pixabayId or type, skipping:", item);
              return null;
            }

            let pixabayUrl = "";
            if (mediaType === "film") {
              pixabayUrl = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&id=${pixabayId}`;
            } else if (mediaType === "image") {
              pixabayUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&id=${pixabayId}`;
            } else {
              console.warn(
                `Unknown media type: ${mediaType} for ID: ${pixabayId}, skipping.`,
                item
              );
              return null;
            }

            try {
              const response = await fetch(pixabayUrl);
              const pixabayData = await response.json();

              if (pixabayData.hits && pixabayData.hits.length > 0) {
                const hit = pixabayData.hits[0];
                item.tag = hit.tags || item.tag || "ไม่ระบุชื่อสินค้า";
                item.type = mediaType; // ใช้ mediaType ที่ถูกแปลงแล้ว
                item.pixabayId = pixabayId;

                if (mediaType === "film") {
                  item.previewUrl = hit.videos.tiny.url;
                  item.thumbnailUrl = hit.videos.tiny.thumbnail;
                  item.fullUrl = hit.videos.large.url;
                  item.duration = hit.duration;
                  item.views = hit.views;
                  item.downloads = hit.downloads;
                  item.likes = hit.likes;
                } else {
                  // mediaType === 'image'
                  item.previewUrl = hit.previewURL;
                  item.thumbnailUrl = hit.webformatURL;
                  item.fullUrl = hit.largeImageURL;
                  item.views = hit.views;
                  item.downloads = hit.downloads;
                  item.likes = hit.likes;
                }
                //console.log(`Processed item for ID: ${pixabayId}, type: ${mediaType}`, item);
              } else {
                console.warn(
                  `No Pixabay data found for ID: ${pixabayId}, type: ${mediaType}`
                );
                item.previewUrl =
                  "https://via.placeholder.com/400x300?text=No+Preview";
                item.thumbnailUrl =
                  "https://via.placeholder.com/150x100?text=No+Thumbnail";
                item.fullUrl = "#";
                item.type = mediaType;
                item.tag = item.tag || "ข้อมูลไม่พร้อมใช้งาน";
                item.pixabayId = pixabayId;
              }
            } catch (mediaApiError) {
              console.warn(
                `Failed to fetch media from Pixabay for ID: ${pixabayId}, type: ${mediaType}`,
                mediaApiError
              );
              item.previewUrl =
                "https://via.placeholder.com/400x300?text=Error+Loading";
              item.thumbnailUrl =
                "https://via.placeholder.com/150x100?text=Error+Loading";
              item.fullUrl = "#";
              item.type = mediaType;
              item.tag = item.tag || "เกิดข้อผิดพลาด";
              item.pixabayId = pixabayId;
            }
            return item;
          })
        );
        allMediaItems = processedItems.filter((item) => item !== null);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      loading = false;
      updateDisplayedMedia();
    }
  }

  function updateDisplayedMedia() {
    if (selectedMediaType === "film") {
      displayedMedia = allMediaItems.filter((item) => item.type === "film");
    } else {
      displayedMedia = allMediaItems.filter((item) => item.type === "image");
    }
  }

  function handleTabChange(event) {
    selectedMediaType = event.detail;
  }

  $: selectedMediaType, updateDisplayedMedia();

  onMount(() => {
    checkUser().then(() => fetchOrders());

    scheduleLayoutRecalculation();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
      clearTimeout(resizeTimeout);
      clearTimeout(layoutTimeout);
    };
  });

  $: if (displayedMedia && galleryContainer) {
    scheduleLayoutRecalculation();
  }
</script>

<div class="min-h-screen bg-white">
  <div class="bg-white border-b border-gray-100 py-6">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-2xl font-light text-gray-800 mb-2 mt-4">สื่อของฉัน</h1>
      <p class="text-gray-500 text-sm">รูปภาพและวิดีโอที่ซื้อแล้วทั้งหมด</p>

      <MediaTabs {selectedMediaType} on:change={handleTabChange} />
    </div>
  </div>

  <div class="max-w-6xl mx-auto px-4 py-8">
    {#if loading}
      <div class="flex justify-center items-center py-20">
        <Loading />
      </div>
    {:else if displayedMedia.length === 0}
      <div class="text-center py-20">
        <div class="w-64 h-64 mx-auto mb-4 bg-gray-100">
          {#if selectedMediaType === "image"}
            <div class="flex flex-col items-center justify-center h-full">
              <svg
                class="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 class="text-lg font-medium text-gray-800 mb-2 mt-4">
                ยังไม่มีรูปภาพ
              </h3>
              <p class="text-gray-500">คุณยังไม่ได้ซื้อรูปภาพใดๆ</p>
            </div>
          {:else}
            <div class="flex flex-col items-center justify-center h-full">
              <svg
                class="w-8 h-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                ><path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4.025a1 1 0 001.555.832l3-2.004a1 1 0 000-1.664l-3-2.004z"
                  clip-rule="evenodd"
                /></svg
              >
              <h3 class="text-lg font-medium text-gray-800 mb-2 mt-4">
                ยังไม่มีวิดีโอ
              </h3>
              <p class="text-gray-500">คุณยังไม่ได้ซื้อวิดีโอใดๆ</p>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div bind:this={galleryContainer} class="masonry-container relative">
        {#each displayedMedia as media (media.pixabayId)}
          <MediaItem {media} on:load={handleMediaItemLoad} />
        {/each}
      </div>

      <div class="text-center mt-8 pt-8 border-t border-gray-100">
        <p class="text-sm text-gray-500">
          {selectedMediaType === "film" ? "วิดีโอ" : "รูปภาพ"}ทั้งหมด {displayedMedia.length}
          {selectedMediaType === "film" ? "วิดีโอ" : "รูป"}
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .masonry-container {
    position: relative;
  }

  .masonry-item {
    transition:
      top 0.3s ease,
      left 0.3s ease,
      width 0.3s ease;
  }

  /* Responsive adjustments for small screens (handled by CSS flex) */
  @media (max-width: 640px) {
    .masonry-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      height: auto !important;
    }
    .masonry-item {
      width: 100% !important;
      position: relative !important;
      left: auto !important;
      top: auto !important;
      margin-bottom: 0;
    }
  }
</style>
