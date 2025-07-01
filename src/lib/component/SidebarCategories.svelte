<script>
    import { onMount } from "svelte";

    export let categories = [];
    let randomImages = [];

    // Pixabay API Key (Consider moving to .env file or passing as prop if used in multiple places)
    const PIXABAY_API_KEY = "50765576-063541adb5bf9e4e495b0638b";

    onMount(async () => {
        try {
            const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&order=latest&per_page=4&safesearch=true&image_type=photo`);
            const data = await response.json();
            randomImages = data.hits || [];
        } catch (error) {
            console.error("Error fetching random images:", error);
            randomImages = []; // Ensure it's an array in case of error
        }
    });
</script>

<aside class="w-full md:w-1/3 lg:w-1/4">
      <div class="space-y-6">
        <!-- Categories Section -->
        <div class="p-4 bg-white border border-gray-200 rounded-sm shadow-sm">
          <h2 class="text-lg font-semibold text-slate-800 mb-4 border-l-4 border-violet-400 pl-2">หมวดหมู่</h2>
          <nav>
            <ul>
              {#each categories as category (category.id)}
                <li class="mb-2">
                  <a
                    href={category.link}
                    class="flex items-center p-2 text-sm text-slate-700 hover:bg-violet-100 hover:text-violet-700 rounded-md transition-colors duration-200"
                  >
                    <img
                      src={category.imageUrl}
                      alt=""
                      class="w-5 h-5 mr-3 object-contain"
                    />
                    {category.name}
                  </a>
                </li>
              {/each}
            </ul>
          </nav>
        </div>

        <!-- Random Images Section -->
        <div class="p-4 bg-white border border-gray-200 rounded-sm shadow-sm">
          <h2 class="text-lg font-semibold text-slate-800 mb-4 border-l-4 border-sky-500 pl-2">ภาพสุ่ม (Random)</h2>
          <div class="space-y-3">
            {#if randomImages.length > 0}
              {#each randomImages as image (image.id)}
                <a href="product?id={image.id}" rel="noopener noreferrer" class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-150 group">
                  <img src={image.previewURL} alt="Random: {image.tags}" class="w-12 h-12 object-cover rounded-md flex-none group-hover:opacity-80 transition-opacity">
                  <div class="flex-grow overflow-hidden">
                    <p class="text-xs text-slate-700 font-medium line-clamp-1 group-hover:text-sky-600" title={image.tags}>
                      {image.tags || 'Untitled Image'}
                    </p>
                    {#if image.user}
                      <p class="text-xs text-slate-500 line-clamp-1">By: {image.user}</p>
                    {/if}
                  </div>
                </a>
              {/each}
            {:else}
              <p class="text-xs text-slate-500">กำลังโหลดภาพสุ่ม...</p>
            {/if}
          </div>
        </div>
        
      </div>
    </aside>