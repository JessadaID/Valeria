<script>
    import { createEventDispatcher } from 'svelte';

    export let media; // Prop สำหรับรับข้อมูล media item (image หรือ video)

    const dispatch = createEventDispatcher();

    // Utility function for converting seconds to MM:SS format
    function convertSecondsToMinutes(seconds) {
        if (typeof seconds !== 'number' || seconds < 0) {
            return "0:00";
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function handleMediaLoad() {
        dispatch('load'); // ส่ง event 'load' ออกไปเมื่อรูปภาพ/วิดีโอ (thumbnail) โหลดเสร็จ
    }
</script>

<div class="masonry-item mb-5">
    <div class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="relative overflow-hidden">
            {#if media.type === 'video'}
                <a href="/product?id={media.pixabayId}&type=video">
                    <img
                        src={media.thumbnailUrl}
                        alt={media.tag || 'วิดีโอ'}
                        class="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        on:load={handleMediaLoad}
                        loading="lazy"
                    />
                    <div class="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-100 group-hover:opacity-100">
                        <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4.025a1 1 0 001.555.832l3-2.004a1 1 0 000-1.664l-3-2.004z" clip-rule="evenodd" /></svg>
                    </div>
                    <div class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                        {convertSecondsToMinutes(media.duration)}
                    </div>
                </a>
            {:else}
                <div class="relative">
                    <a href="/product?id={media.pixabayId}&type=image">
                        <img
                            src={media.thumbnailUrl || media.previewUrl}
                            alt={media.tag || 'รูปภาพ'}
                            class="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            on:load={handleMediaLoad}
                            loading="lazy"
                        />
                    </a>
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    </div>
                    <a
                        href={media.fullUrl}
                        download={`pixabay-${media.pixabayId}-${media.tag.split(',')[0].trim()}.${media.fullUrl.split('.').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full flex items-center justify-center hover:bg-white hover:text-blue-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100 pointer-events-auto"
                        aria-label="ดาวน์โหลดรูปภาพ"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </a>
                </div>
            {/if}
        </div>
        <div class="p-4">
            <h3 class="text-md font-medium text-gray-800 truncate capitalize">
                {media.tag.split(',')[0].trim() || (media.type === 'video' ? 'วิดีโอ' : 'รูปภาพ')}
            </h3>
            <p class="text-xs text-gray-500 mt-1">ID: {media.pixabayId}</p>
        </div>
    </div>
</div>