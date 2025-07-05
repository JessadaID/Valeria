<script>
    import { page } from "$app/stores";
    import { formatNumber } from "$lib/formatNumber";
    import { formatFileSize } from "$lib/formatFilesize";
    import { Addtocart } from "$lib/Addtocart";
    import Loading from "$lib/component/Loading.svelte";
    // goto and onMount are not strictly needed with the reactive approach below

    const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

    let apiUrl = '';
    let imageDetails = null;
    let imageTag = null;
    let loading = true; // Assume loading until we determine if an ID exists to fetch
    let error = null;
    let currentId = null; // To track the ID being fetched/displayed to avoid redundant fetches
    let type = 'all'; // Default type, can be overridden by query parameter
    // Reactive effect for fetching when the `id` query parameter changes
    // Reactive effect for fetching when the `id` query parameter changes
    $: {
        const newIdFromQuery = $page.url.searchParams.get('id');
        const newtype = $page.url.searchParams.get('type') || 'all';
        if (newIdFromQuery) {
            if (newIdFromQuery !== currentId) { // Only fetch if ID has actually changed
                currentId = newIdFromQuery;
                type = newtype; // Update type based on query parameter
                loading = true;
                imageDetails = null; // Clear old details
                error = null; // Clear old errors
                fetchImageDetails(currentId);
                fetchimagebytag(imageDetails);
            }
        } else {
            // No ID in URL
            currentId = null;
            loading = false;
            imageDetails = null;
            error = "ไม่พบ ID รูปภาพใน URL";
        }
    }

    async function fetchImageDetails(imageId) {
        loading = true;
        error = null;
        imageDetails = null; // Clear previous details

        if (!imageId) {
            error = "ไม่พบ ID รูปภาพ";
            loading = false;
            imageDetails = null;
            return;
        }

        try {
            if(type === 'video'){
                apiUrl = `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&id=${encodeURIComponent(imageId)}`;
            }else{
                apiUrl = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&id=${encodeURIComponent(imageId)}`;
            }
            const respond = await fetch(apiUrl);

            if (!respond.ok) {
                console.error(`HTTP error! status: ${respond.status} for ID: ${imageId}`);
                error = `ไม่สามารถดึงข้อมูลได้: ${respond.statusText} (ID: ${imageId})`;
                // imageDetails remains null
                return;
            }

            const data = await respond.json();

            if (data.hits && data.hits.length > 0) {
                imageDetails = data.hits[0]; // Pixabay returns an array even for a single ID
                // Add a mock price for consistency, as Pixabay API doesn't provide it
                if (!imageDetails.price) {
                    imageDetails.price = 29; // Default price
                }

                fetchimagebytag(imageDetails);
            } else {
                error = `ไม่พบรูปภาพสำหรับ ID: ${imageId}`;
                // imageDetails remains null
            }
        } catch (err) {
            console.error("Error fetching image details:", err);
            error = "เกิดข้อผิดพลาดในการดึงข้อมูล";
        } finally {
            loading = false;
        }
    }

    async function fetchimagebytag(imageDetails){
        //console.log(imageDetails.tags.split(',')[0].trim())
        const respond = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${imageDetails.tags.split(',')[0].trim()}&per_page=4&page=2`)
        const data = await respond.json();
        imageTag = data.hits;
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
                    <li class="flex items-center"><span class="text-gray-700 font-medium">รูปภาพ ID: {imageDetails.id}</span></li>
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
                            {imageDetails.tags.split(',')[0].trim() || 'Untitled Image'}
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
                            <a href="{imageDetails.largeImageURL}" download="{`pixabay-${imageDetails.id}-${imageDetails.tags.split(',')[0].trim()}`}" target="_blank" rel="noopener noreferrer" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                ดาวน์โหลด (ตัวอย่าง)
                            </a>
                        </div>
                    </div>

               
                </div>
            </div>


            <div class="grid grid-cols-3  lg:grid-cols-3 gap-8 lg:gap-12 mt-6">
                     <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200 col-span-2">
                        <h3 class="text-md font-semibold text-gray-700 mb-4">รายละเอียดรูปภาพ</h3>
                        <ul class=" text-sm text-gray-600 grid lg:grid-cols-2 sm:grid-cols-1 ">
                            <div class="lg:p-2 sm:p-0 lg:border-r-2 border-violet-500 ">
                                <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ID:</span> <span class="font-medium text-gray-800">{imageDetails.id}</span></li>
                                <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ประเภท:</span> <span class="font-medium text-gray-800 capitalize">{imageDetails.type}</span></li>
                                <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ขนาด:</span> <span class="font-medium text-gray-800">{imageDetails.imageWidth} x {imageDetails.imageHeight} px</span></li>
                                <li class="flex justify-between border-b border-gray-100 sm:pb-1.5 lg:pb-0 "><span>ขนาดไฟล์:</span> <span class="font-medium text-gray-800">{formatFileSize(imageDetails.imageSize)}</span></li>
                            </div>
                            <div class="lg:p-2 sm:p-0 ">
                                <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ยอดชม:</span> <span class="font-medium text-gray-800">{formatNumber(imageDetails.views)}</span></li>
                                <li class="flex justify-between border-b border-gray-100 pb-1.5"><span>ดาวน์โหลด:</span> <span class="font-medium text-gray-800">{formatNumber(imageDetails.downloads)}</span></li>
                                <li class="flex justify-between border-b border-gray-100 " ><span>ถูกใจ:</span> <span class="font-medium text-gray-800">{formatNumber(imageDetails.likes)}</span></li>
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

            <!-- Related Images Section (Placeholder for future enhancement) -->
            <div class="mt-12 pt-8 border-t border-gray-300 grid grid-cols-4 gap-4">
                <p class="text-xl text-gray-800 col-span-4">รูปที่คล้ายกัน</p>
                {#each imageTag as img }
                    <div class="h-45 object-cover">
                        <a href="product?id={img.id}" ><img src="{img.webformatURL}" alt="{img.tags}" class="w-full h-full"></a>
                    </div>
                {/each}
               
            </div>
        </div>
    {:else}
        <div class="text-center py-10 bg-white shadow-md rounded-lg p-8">
             <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-xl text-gray-600 mt-4 mb-6">ไม่พบข้อมูลรูปภาพสำหรับ ID ที่ระบุ หรือ ID ไม่ถูกต้อง</p>
             <a href="/" class="mt-6 inline-block bg-violet-500 hover:bg-violet-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                กลับไปหน้าแรก
            </a>
        </div>
    {/if}
</div>

