<script>
  import Carousel from "$lib/component/carousel.svelte";
  import SidebarCategories from "$lib/component/SidebarCategories.svelte";
  import MasonryGallery from "$lib/component/MasonryGallery.svelte";

  export let data;
  $: ({ goods, randomImages } = data);

  const categories = [
    {
      id: "all",
      name: "ทั้งหมด",
      imageUrl: "/icons/all-types.svg",
      link: "/category/all",
    },
    {
      id: "photo",
      name: "รูปถ่าย",
      imageUrl: "/icons/camera-icon.svg",
      link: "/category/photo",
    },
    {
      id: "illustration",
      name: "ภาพประกอบ",
      imageUrl: "/icons/illustration.svg",
      link: "/category/illustration",
    },
    {
      id: "vector",
      name: "เวกเตอร์",
      imageUrl: "/icons/vector.svg",
      link: "/category/vector",
    },
    {
      id: "video",
      name: "วีดีโอ",
      imageUrl: "/icons/video.svg",
      link: "/category/video",
    },
  ];
</script>

<div class="min-h-screen bg-gray-50/30">
  <div class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
    <div class="flex flex-col lg:flex-row gap-8">
      <SidebarCategories {categories} {randomImages} />

      <main class="flex-1">
        <div class="mb-12">
          <Carousel />
        </div>

        <section class="mb-16">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {#each categories as category (category.id)}
              <a
                href={category.link}
                class="group bg-white p-2 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex items-center space-x-4">
                  <div
                    class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors"
                  >
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

        <section class="mb-16">
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">
              สินค้าแนะนำ
            </h2>
            <p class="text-gray-600 text-sm">คัดสรรคุณภาพดีสำหรับคุณ</p>
          </div>

          <MasonryGallery {goods} />
        </section>
      </main>
    </div>
  </div>
</div>

<style>
  html {
    scroll-behavior: smooth;
  }

  button:focus,
  a:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>
