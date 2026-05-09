
<script>
  import { onMount, onDestroy } from 'svelte';



  

   
  let currentIndex = 0;
  let intervalId;
  const autoplayDelay = 5000;
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
      id: 3,
      imageUrl: "/corusel/sky.jpg",
      altText:"20% off",
      html:`
      <div class='w-full px-10'>
        <p class='text-7xl text-white font-bold'>สมัครตอนนี้ ฟรี 1 รูป </p>
        <br/>
          <a href='/signup'><button class='w-30 h-12 my-auto bg-blue-500 hover:bg-blue-600 text-white content-center font-bold'>สมัครเลย</button></a>
      </div>
      `,
    },
  
  ];

  function startAutoplay() {
    if (intervalId) clearInterval(intervalId);
    if (promotions.length > 1) {
      intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % promotions.length;
      }, autoplayDelay);
    }
  }

  function stopAutoplay() {
    if (intervalId) clearInterval(intervalId);
  }

  onMount(async () => {

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
      promotions = carouselData.length > 0 ? carouselData : promotions;
      currentIndex = 0;
      startAutoplay();
    } catch (error) {
      console.error("Failed to fetch carousel images:", error);

      currentIndex = 0;
      startAutoplay();
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    startAutoplay();
  }
</script>

<div class="container ">
  <div
    class="relative w-full shadow-md rounded-md h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden"
    role="region"
    aria-roledescription="carousel"
    aria-label="Promotional content carousel"
  >
    
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
  
  
  
  
  
  img {
    display: block; 
  }
</style>