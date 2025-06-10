<script>
  import Carousel from "$lib/component/carousel.svelte";
  import SidebarCategories from "$lib/component/SidebarCategories.svelte";
  import MasonryGallery from "$lib/component/MasonryGallery.svelte";
  import { onMount } from "svelte";

  // Define categories with names and image URLs
  const categories = [
    {
      id: 'all',
      name: "ทั้งหมด",
      imageUrl: "/icons/all-types.svg", // Consider adding a generic icon for "all"
      link: "/category/all",
    },
    {
      id: 'photo',
      name: "รูปถ่าย",
      imageUrl: "/icons/camera-icon.svg", // Reusing existing icon
      link: "/category/photo",
    },
    {
      id: 'illustration',
      name: "ภาพประกอบ",
      imageUrl: "/icons/illustration.svg", // Add an icon for illustrations
      link: "/category/illustration",
    },
    {
      id: 'vector',
      name: "เวกเตอร์",
      imageUrl: "/icons/vector.svg", // Add an icon for vectors
      link: "/category/vector",
    },
    {
      id: 'video',
      name: "วีดีโอ",
      imageUrl: "/icons/video.svg", // Add an icon for videos'
      link: "/category/video",
    }
  ];

  let goods = [];
  
  // Pixabay API Key (Consider moving to .env file for better practice)
  const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

  onMount(async () => {
    const respond = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&order=popular&per_page=8&safesearch=true`);
    const data = await respond.json();
    goods = data.hits;
  });

</script>

<div class="min-h-screen bg-gray-50/30">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Left Sidebar for Categories -->
        <SidebarCategories {categories} />

      <!-- Main Content Area -->
      <main class="flex-1">
        <!-- Carousel Section -->
        <div class="mb-12">
          <Carousel />
        </div>

        <!-- Categories Section -->
        <section class="mb-16">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {#each categories as category (category.id)}
              <a
                href={category.link}
                class="group bg-white p-2 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      class="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900 text-sm">
                      {category.name}
                    </h3>
                    <p class="text-xs text-gray-500 mt-1">ดูทั้งหมด</p>
                  </div>
                </div>
              </a>
            {/each}
          </div>
        </section>

        <!-- Gallery Section -->
        <section class="mb-16">
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">สินค้าแนะนำ</h2>
            <p class="text-gray-600 text-sm">คัดสรรคุณภาพดีสำหรับคุณ</p>
          </div>
          
          <!-- Masonry Gallery Container -->
          <MasonryGallery {goods} />
        </section>
      </main>
    </div>
  </div>
</div>

<style>
  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
  
  /* Focus states for accessibility */
  button:focus,
  a:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>