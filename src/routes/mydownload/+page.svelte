<script>
    import Loading from "$lib/component/Loading.svelte";
    import { supabase } from "$lib/supabaseClient";
    import { onMount, tick } from "svelte";

    let images = [];
    let loading = false;
    let currentUser = null;
    let galleryContainer;
    let resizeTimeout;
    let layoutTimeout;

    // Debounced version of initMasonryLayout
    function scheduleLayoutRecalculation() {
        clearTimeout(layoutTimeout);
        layoutTimeout = setTimeout(async () => {
            await tick(); // Ensure DOM is updated before layout calculation
            initMasonryLayout();
        }, 60);
    }

    function getColumnCount() {
        if (typeof window === 'undefined') return 3; // Default for SSR or non-browser
        const width = window.innerWidth;
        if (width >= 1280) return 4; // xl
        if (width >= 1024) return 3; // lg
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
                item.style.width = '100%';
            });
            return;
        }
        
        if (items.length === 0) {
            galleryContainer.style.height = '0px';
            return;
        }

        const gap = 20;
        const columns = getColumnCount();
        const columnHeights = new Array(columns).fill(0);

        items.forEach(item => {
            const itemHeight = item.offsetHeight;
            if (itemHeight === 0) return;

            const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
            
            item.style.position = 'absolute';
            item.style.left = `${shortestColumnIndex * (100 / columns)}%`;
            item.style.top = `${columnHeights[shortestColumnIndex]}px`;
            item.style.width = `calc(${(100 / columns)}% - ${gap * (columns - 1) / columns}px)`;
            
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

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
    }

    async function fetchOrders(){
        loading = true;

        await checkUser();
        if (!currentUser) return;

        try {
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', currentUser.id)

            if (orderError) {
                throw orderError;
            }

            images = orderData.flatMap((image) => image.order_items);
            if (images && images.length > 0) {
                const processedItems = await Promise.all(
                    images.map(async (item) => {
                        if (item.image_id) {
                            try {
                                const pixabayApiKey = import.meta.env.VITE_PIXABAY_API_KEY;
                                const pixabayUrl = `https://pixabay.com/api/?key=${pixabayApiKey}&id=${item.image_id}`;
                                const response = await fetch(pixabayUrl);
                                const pixabayData = await response.json();
                                if (pixabayData.hits && pixabayData.hits.length > 0) {
                                    item.imageUrl = pixabayData.hits[0].webformatURL;
                                    item.thumbnailUrl = pixabayData.hits[0].previewURL;
                                    item.tag = pixabayData.hits[0].tags || item.tag || 'ไม่ระบุชื่อสินค้า';
                                } else {
                                    item.imageUrl = 'https://via.placeholder.com/400x300';
                                    item.thumbnailUrl = 'https://via.placeholder.com/150x100';
                                }
                            } catch (imageError) {
                                console.warn('Failed to fetch image:', imageError);
                                item.imageUrl = 'https://via.placeholder.com/400x300';
                                item.thumbnailUrl = 'https://via.placeholder.com/150x100';
                            }
                        } else {
                            item.imageUrl = 'https://via.placeholder.com/400x300';
                            item.thumbnailUrl = 'https://via.placeholder.com/150x100';
                        }
                        return item;
                    })
                );
                images = processedItems;
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        checkUser().then(() => fetchOrders());
        
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

    // Recalculate layout if the images array changes
    $: if (images && galleryContainer) {
        scheduleLayoutRecalculation();
    }
</script>

<div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 py-6">
        <div class="max-w-6xl mx-auto px-4">
            <h1 class="text-2xl font-light text-gray-800 mb-2 mt-4">รูปภาพของฉัน</h1>
            <p class="text-gray-500 text-sm">รูปภาพที่ซื้อแล้วทั้งหมด</p>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 py-8">
        {#if loading}
            <div class="flex justify-center items-center py-20">
                <Loading />
            </div>
        {:else if images.length === 0}
            <div class="text-center py-20">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-800 mb-2">ยังไม่มีรูปภาพ</h3>
                <p class="text-gray-500">คุณยังไม่ได้ซื้อรูปภาพใดๆ</p>
            </div>
        {:else}
            <!-- Images Masonry Gallery -->
            <div bind:this={galleryContainer} class="masonry-container relative">
                {#each images as image (image.image_id)}
                    <div class="masonry-item mb-5">
                        <div class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                            <div class="relative overflow-hidden">
                                <img
                                    src={image.imageUrl || image.thumbnailUrl}
                                    alt={image.tag || 'รูปภาพ'}
                                    class="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                    on:load={handleImageLoad}
                                    loading="lazy"
                                />
                                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button 
                                        class="w-12 h-12 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full flex items-center justify-center hover:bg-white hover:text-blue-600 transition-colors shadow-lg"
                                        on:click={() => window.open(image.imageUrl, '_blank')}
                                        aria-label="ดาวน์โหลดรูปภาพ"
                                    >
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                     
                        </div>
                    </div>
                {/each}
            </div>
            
            <!-- Images Count -->
            <div class="text-center mt-8 pt-8 border-t border-gray-100">
                <p class="text-sm text-gray-500">
                    รูปภาพทั้งหมด {images.length} รูป
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
        transition: top 0.3s ease, left 0.3s ease, width 0.3s ease;
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