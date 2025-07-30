<script>
    import { page } from "$app/stores";
    import { formatNumber } from "$lib/formatNumber";
    import { formatFileSize } from "$lib/formatFilesize";
    import { Addtocart } from "$lib/Addtocart";
    import Loading from "$lib/component/Loading.svelte";

    const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

    let apiUrl = '';
    let imageDetails = null; // ควรเปลี่ยนเป็น mediaDetails เพื่อให้ครอบคลุมทั้งรูปภาพและวิดีโอ
    let imageTag = null; // ควรเปลี่ยนเป็น relatedMedia
    let loading = true;
    let error = null;
    let currentId = null;
    let type = 'all'; // Default type, can be overridden by query parameter

    $: {
        const newIdFromQuery = $page.url.searchParams.get('id');
        const newTypeFromQuery = $page.url.searchParams.get('type') || 'all'; // ใช้ newTypeFromQuery
        if (newIdFromQuery) {
            if (newIdFromQuery !== currentId || newTypeFromQuery !== type) { // ตรวจสอบ type ด้วย
                currentId = newIdFromQuery;
                type = newTypeFromQuery; // Update type
                loading = true;
                imageDetails = null;
                error = null;
                fetchMediaDetails(currentId, type); // เปลี่ยนไปเรียก fetchMediaDetails
            }
        } else {
            currentId = null;
            loading = false;
            imageDetails = null;
            error = "ไม่พบ ID รูปภาพ/วิดีโอใน URL";
        }
    }

    // เปลี่ยนชื่อฟังก์ชันเป็น fetchMediaDetails เพื่อให้ครอบคลุมทั้งรูปภาพและวิดีโอ
    async function fetchMediaDetails(id, mediaType) {
        loading = true;
        error = null;
        imageDetails = null;

        if (!id) {
            error = "ไม่พบ ID รูปภาพ/วิดีโอ";
            loading = false;
            return;
        }

        try {
            let detailUrl;
            if(mediaType === 'video'){
                detailUrl = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&id=${encodeURIComponent(id)}`;
            } else {
                detailUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&id=${encodeURIComponent(id)}`;
            }
            
            const respond = await fetch(detailUrl);

            if (!respond.ok) {
                console.error(`HTTP error! status: ${respond.status} for ID: ${id}`);
                error = `ไม่สามารถดึงข้อมูลได้: ${respond.statusText} (ID: ${id})`;
                return;
            }

            const data = await respond.json();

            if (data.hits && data.hits.length > 0) {
                imageDetails = data.hits[0]; // Pixabay returns an array even for a single ID
                if (!imageDetails.price) {
                    imageDetails.price = 29; // Default price
                }
                // ***เรียกใช้ fetchRelatedMediaByTag ตรงนี้***
                fetchRelatedMediaByTag(imageDetails, mediaType); 
            } else {
                error = `ไม่พบข้อมูลสำหรับ ID: ${id}`;
            }
        } catch (err) {
            console.error("Error fetching media details:", err);
            error = "เกิดข้อผิดพลาดในการดึงข้อมูล";
        } finally {
            loading = false;
        }
    }

    // เปลี่ยนชื่อฟังก์ชันเป็น fetchRelatedMediaByTag
    async function fetchRelatedMediaByTag(details, mediaType, excludeId = null) {
        if (!details || !details.tags) {
            console.warn("Details or tags are missing. Returning empty array for related media.");
            return [];
        }

        try {
            const tagsArray = details.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            let searchTags = '';
            if (tagsArray.length > 0) {
                searchTags = tagsArray.slice(0, Math.min(tagsArray.length, 3)).join('+');
            } else {
                console.warn("No valid tags found after parsing. Returning empty array for related media.");
                return [];
            }

            if (!searchTags) {
                console.warn("Search tags are empty. Returning empty array for related media.");
                return [];
            }

            const encodedTags = encodeURIComponent(searchTags);
            let url;

            if (mediaType === 'video') {
                url = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${encodedTags}&per_page=4&page=1`;
            } else {
                url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodedTags}&per_page=4&page=1`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.hits) {
                let filteredHits = data.hits;
                if (excludeId !== null) {
                    filteredHits = data.hits.filter(item => item.id !== excludeId);
                }
                imageTag = filteredHits; // อัปเดต state variable สำหรับสื่อที่คล้ายกัน
            } else {
                console.warn(`No 'hits' array found in Pixabay ${mediaType.toUpperCase()} API response for related media.`);
                imageTag = [];
            }
            return imageTag;
        } catch (error) {
            console.error(`Error fetching related ${mediaType} from Pixabay:`, error);
            imageTag = []; // Clear imageTag on error
            return [];
        }
    }

    // src/lib/utils.js หรือไฟล์ที่คุณต้องการเก็บฟังก์ชัน util
    function convertSecondsToMinutes(seconds) {
        if (typeof seconds !== 'number' || seconds < 0) {
            return "Invalid input"; // หรือ throw error ตามความเหมาะสม
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        // จัดรูปแบบให้เป็น MM:SS
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
</script>

<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50">
    {#if loading}
        <Loading />
    {:else if error}
        <div class="text-center py-10 bg-white shadow-md rounded-lg p-8">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-2xl font-semibold text-red-600 mt-4 mb-2">เกิดข้อผิดพลาด</p>
            <p class="text-gray-700 mb-6">{error}</p>
            <a href="/" class="mt-6 inline-block bg-violet-500 hover:bg-violet-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                กลับไปหน้าแรก
            </a>
        </div>
    {:else if imageDetails}
        <div class="max-w-6xl mx-auto">
            <nav class="text-sm mb-6" aria-label="Breadcrumb">
                <ol class="list-none p-0 inline-flex space-x-2 text-gray-500">
                    <li class="flex items-center"><a href="/" class="hover:text-violet-600">หน้าแรก</a><svg class="fill-current w-3 h-3 mx-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg></li>
                    <li class="flex items-center"><span class="text-gray-700 font-medium">{type === 'video' ? 'วิดีโอ' : 'รูปภาพ'} ID: {imageDetails.id}</span></li>
                </ol>
            </nav>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <div class="lg:col-span-2 bg-whtie p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 flex items-center align-center">
                    {#if type === 'video'}
                        <video controls class="w-full mt-4 rounded-md">
                            <source src="{imageDetails.videos.large.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    {:else}
                        <img 
                        src="{imageDetails.largeImageURL || imageDetails.webformatURL}" 
                        alt="{imageDetails.tags}" 
                        class="w-full h-auto object-contain rounded-md max-h-[75vh]"
                        loading="lazy"
                        />
                    {/if}
                </div>

                <div class="lg:col-span-1 space-y-6">
                    <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                        <h1 class="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 capitalize">
                            {imageDetails.tags.split(',')[0].trim() || 'Untitled Media'}
                        </h1>
                        {#if imageDetails.user}
                        <p class="text-sm text-gray-500 mb-4">
                            โดย: 
                            <a href="{`https://pixabay.com/users/${imageDetails.user}-${imageDetails.user_id}/`}" target="_blank" rel="noopener noreferrer" class="text-violet-600 hover:underline">{imageDetails.user}</a>
                        </p>
                        {/if}

                        <div class="mb-5">
                            <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1.5">Tags:</h3>
                            <div class="flex flex-wrap gap-2">
                                {#each imageDetails.tags.split(',').map(tag => tag.trim()) as tag (tag)}
                                    <a href={`/search?q=${encodeURIComponent(tag)}`} class="text-xs bg-gray-100 hover:bg-violet-100 text-gray-700 hover:text-violet-700 px-2.5 py-1 rounded-full transition-colors">{tag}</a>
                                {/each}
                            </div>
                        </div>
                        
                        <div class="my-6">
                            <p class="text-3xl font-bold text-gray-900">฿{imageDetails.price.toLocaleString()}</p>
                            <p class="text-sm text-gray-500">ใบอนุญาตมาตรฐาน (Standard License)</p>
                            <a href="{imageDetails.pageURL}" target="_blank" rel="noopener noreferrer" class="text-xs text-violet-500 hover:underline">ดูรายละเอียดบน Pixabay</a>
                        </div>

                        <div class="space-y-3">
                            <button on:click={() => Addtocart(imageDetails)}
                                class="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                                เพิ่มในตะกร้า
                            </button>
                            <a href="{imageDetails.largeImageURL || (imageDetails.videos && imageDetails.videos.large.url)}" 
                                download="{`pixabay-${imageDetails.id}-${imageDetails.tags.split(',')[0].trim()}`}" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                ดาวน์โหลด (ตัวอย่าง)
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-3 lg:grid-cols-3 gap-8 lg:gap-12 mt-6">
                <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200 col-span-2">
                    <h3 class="text-md font-semibold text-gray-700 mb-4">รายละเอียด{type === 'video' ? 'วิดีโอ' : 'รูปภาพ'}</h3>
                    <ul class="text-sm text-gray-600 grid lg:grid-cols-2 sm:grid-cols-1">
                        <div class="lg:p-2 sm:p-0 lg:border-r-2 border-violet-500">
                            <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ID:</span> <span class="font-medium text-gray-800">{imageDetails.id}</span></li>
                            <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ประเภท:</span> <span class="font-medium text-gray-800 capitalize">{imageDetails.type}</span></li>
                            {#if type === 'video'}
                            <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ความยาววิดีโอ:</span> <span class="font-medium text-gray-800">{convertSecondsToMinutes(imageDetails.duration)} นาที</span></li>
                            <li class="flex justify-between border-b border-gray-100 sm:pb-1.5 lg:pb-0"><span>ขนาดไฟล์:</span> <span class="font-medium text-gray-800">{formatFileSize(imageDetails.videos.large.size)}</span></li>
                            {:else}
                            <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ขนาด:</span> <span class="font-medium text-gray-800">{imageDetails.imageWidth} x {imageDetails.imageHeight} px</span></li>
                            <li class="flex justify-between border-b border-gray-100 sm:pb-1.5 lg:pb-0"><span>ขนาดไฟล์:</span> <span class="font-medium text-gray-800">{formatFileSize(imageDetails.imageSize)}</span></li>
                            {/if}
                        </div>
                        <div class="lg:p-2 sm:p-0">
                            <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ยอดชม:</span> <span class="font-medium text-gray-800">{formatNumber(imageDetails.views)}</span></li>
                            <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ดาวน์โหลด:</span> <span class="font-medium text-gray-800">{formatNumber(imageDetails.downloads)}</span></li>
                            <li class="flex justify-between border-b border-gray-100"><span>ถูกใจ:</span> <span class="font-medium text-gray-800">{formatNumber(imageDetails.likes)}</span></li>
                        </div>
                    </ul>
                </div>

                {#if imageDetails.userImageURL && imageDetails.user}
                <div class="col-span-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex items-center space-x-4 align-center">
                    <img src="{imageDetails.userImageURL}" alt="{imageDetails.user}" class="w-16 h-16 rounded-full object-cover border-2 border-violet-200">
                    <div>
                        <p class="text-sm text-gray-500">อัปโหลดโดย</p>
                        <p class="text-lg font-semibold text-gray-800">{imageDetails.user}</p>
                        <a href="{`https://pixabay.com/users/${imageDetails.user}-${imageDetails.user_id}/`}" target="_blank" rel="noopener noreferrer" class="text-xs text-violet-500 hover:underline">ดูโปรไฟล์บน Pixabay</a>
                    </div>
                </div>
                {/if}
            </div>

            <div class="mt-12 pt-8 border-t border-gray-300 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <p class="text-xl text-gray-800 col-span-full">{type === 'video' ? 'วิดีโอที่คล้ายกัน' : 'รูปที่คล้ายกัน'}</p>
                {#each imageTag as item (item.id)}
                    <div class="relative w-full h-40 rounded-md overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                        {#if type === 'video'}
                            <a href="/product?id={item.id}&type=video">
                                <img src="{item.videos.tiny.thumbnail}" alt="{item.tags}" class="w-full h-full object-cover transition-transform hover:scale-105" loading="lazy">
                                <div class="absolute inset-0 bg-opacity-25 flex items-center justify-center">
                                    <svg class="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4.025a1 1 0 001.555.832l3-2.004a1 1 0 000-1.664l-3-2.004z" clip-rule="evenodd" /></svg>
                                </div>
                                <div class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                                    {convertSecondsToMinutes(item.duration)}
                                </div>
                            </a>
                        {:else}
                            <a href="/product?id={item.id}">
                                <img src="{item.webformatURL}" alt="{item.tags}" class="w-full h-full object-cover transition-transform hover:scale-105" loading="lazy">
                            </a>
                        {/if}
                    </div>
                {/each}
            </div>

        </div>
    {:else}
        <div class="text-center py-10 bg-white shadow-md rounded-lg p-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-xl text-gray-600 mt-4 mb-6">ไม่พบข้อมูลรูปภาพ/วิดีโอสำหรับ ID ที่ระบุ หรือ ID ไม่ถูกต้อง</p>
            <a href="/" class="mt-6 inline-block bg-violet-500 hover:bg-violet-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                กลับไปหน้าแรก
            </a>
        </div>
    {/if}
</div>