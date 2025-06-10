<!-- src/routes/+page.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  // import { fade } from 'svelte/transition'; // หากต้องการใช้ Svelte transition


  /**
   * 1080 * 600 px
   */

   
  let currentIndex = 0;
  let intervalId;
  const autoplayDelay = 5000; // เปลี่ยนสไลด์ทุก 5 วินาที (5000ms)
  let promotions = [
    {
      id: 1,
      imageUrl: "/corusel/20 off.jpg",
      altText:"20% off",
      html:`
      <div class='w-full px-10'>
        <p class='text-7xl text-white font-bold'>ลดราคารูปภาพสูงสุด </p>
        <br/>
        <div class='grid grid-cols-3  '>
          <p class='grid-cols-1 text-8xl text-amber-500 font-bold text-shadow-sm '>20%</p>
          <button class='grid-cols-2 w-30 h-12 my-auto bg-emerald-500 hover:bg-emerald-600 text-white content-center font-bold'>เริ่มเลย</button>
        </div>
      </div>
      `,
    },
    {
      id: 2,
      imageUrl: "/corusel/leaf.jpg",
      altText:"20% off",
      html:`
      <div class='w-full px-10 text-right'>
        <p class='text-7xl text-white font-bold'>โปรโมชั่นส่งฟรี </p>
        <br/>
        <p class='text-6xl  text-sky-500 font-bold text-shadow-sm '>วันนี้ - 20 มิ.ย 68</p>
      </div>
      `,
    },
    {
      id: 4,
      imageUrl: "/corusel/sky.jpg",
      altText:"20% off",
      html:`
      <div class='w-full px-10'>
        <p class='text-7xl text-white font-bold'>สมัครตอนนี้ ฟรี 1 รูป </p>
        <br/>
          <button class='w-30 h-12 my-auto bg-blue-500 hover:bg-blue-600 text-white content-center font-bold'>สมัครเลย</button>
      </div>
      `,
    },
  
  ];

  function startAutoplay() {
    if (intervalId) clearInterval(intervalId);
    if (promotions.length > 1) { // เล่นอัตโนมัติเฉพาะเมื่อมีมากกว่า 1 สไลด์
      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % promotions.length;
      }, autoplayDelay);
    }
  }

  function stopAutoplay() {
    if (intervalId) clearInterval(intervalId);
  }

  onMount(async () => {
    // await get_carousel(); // หากต้องการดึงข้อมูลจาก API ให้ uncomment บรรทัดนี้
    if (promotions.length > 0) {
      startAutoplay();
    }
  });

  onDestroy(() => {
    stopAutoplay();
  });

  async function get_carousel (){
    try {
      const response = await fetch("https://6749d22a868020296632bdc7.mockapi.io/carousel-img");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const carouselData = await response.json();
      promotions = carouselData.length > 0 ? carouselData : promotions; // ใช้ข้อมูลที่ fetch มาถ้ามี, มิฉะนั้นใช้ default
      currentIndex = 0; // รีเซ็ตไปยังสไลด์แรก
      startAutoplay(); // เริ่ม/รีสตาร์ท autoplay ด้วยข้อมูลใหม่
    } catch (error) {
      console.error("Failed to fetch carousel images:", error);
      // promotions ยังคงเป็นค่า default ที่กำหนดไว้ด้านบนในกรณี error
      currentIndex = 0;
      startAutoplay(); // พยายามเริ่ม autoplay ด้วยข้อมูล default
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    startAutoplay(); // รีเซ็ต timer ของ autoplay เมื่อผู้ใช้คลิก dot
  }
</script>

<div class="container ">
  <div
    class="relative w-full shadow-md rounded-md h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden"
    role="region"
    aria-roledescription="carousel"
    aria-label="Promotional content carousel"
  >
    <!-- Slides Container -->
    <div class="embla__container">
      {#each promotions as promotion, i (promotion.id)}
        <div
          class="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style:opacity={i === currentIndex ? 1 : 0}
          style:pointer-events={i === currentIndex ? 'auto' : 'none'}
          aria-hidden={i !== currentIndex}
          role="group"
          aria-roledescription="slide"
          aria-label={`Promotion ${i + 1}: ${promotion.altText}`}
        >
          <img
            src={promotion.imageUrl}
            alt={promotion.altText}
            class="w-full h-full object-cover"
            draggable="false" 
          />
          <div class="absolute top-1/2 transform w-full -translate-y-1/2 z-10">
            {@html promotion.html}
          </div>
        </div>
      {/each}
    </div>
    <!-- Prev/Next Buttons and Dot Indicators can be placed outside embla__container but inside .embla -->

    <!-- Prev/Next Buttons 
    <button
      on:click={prevSlide}
      class="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white bg-opacity-60 hover:bg-opacity-90 rounded-full p-2 sm:p-3 z-20 transition-opacity"
      aria-label="Previous slide"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
    </button>
    <button
      on:click={nextSlide}
      class="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white bg-opacity-60 hover:bg-opacity-90 rounded-full p-2 sm:p-3 z-20 transition-opacity"
      aria-label="Next slide"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
    </button>
-->
    <!-- Dot Indicators -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
      {#each promotions as promotion, i (promotion.id)}
        <button
          on:click={() => goToSlide(i)}
          class="w-16 h-1.5 sm:w-10 sm:h-1 transition-colors"
          class:bg-white={i === currentIndex}
          class:bg-gray-400={i !== currentIndex}
          class:hover:bg-gray-200={i !== currentIndex}
          aria-label={`Go to slide ${i + 1}`}
        ></button>
      {/each}
    </div>
  </div>
</div>

<style>
  /* Styles for individual slides and images if needed beyond Tailwind */
  /* The main carousel container now has `position: relative` and `overflow: hidden` via Tailwind/inline style */
  /* Individual slides are `position: absolute` and manage their own opacity for transitions */
  
  /* Ensure images within slides behave correctly */
  img {
    display: block; /* Remove extra space below image if any */
  }
</style>