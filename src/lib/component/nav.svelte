<script>
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
  import { StoreUser as authStore} from '$lib/stores/userStore';
  import { cartStore } from '$lib/stores/cartStore';
  import { onMount, onDestroy } from 'svelte';
  import { warningAlert } from '$lib/alertUtils';

	let searchValue = '';
	let isDropdownVisible = false;
  let cartItems = [];
  let userProfile = null;

  // Reactive statement สำหรับคำนวณจำนวนสินค้าในตะกร้า
  $: cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  // Subscribe to cart store
  const unsubscribeCart = cartStore.subscribe(items => {
    cartItems = items;
  });

  // Subscribe to auth store
  const unsubscribeAuth = authStore.subscribe(storeState => {
    if (storeState && storeState.user) {
      userProfile = storeState.user;
      console.log("User profile updated:", userProfile);
    } else {
      userProfile = null;
    }
  });

	function handleSearch() {
		if (searchValue.trim()) {
			goto(`/search?q=${encodeURIComponent(searchValue.trim())}`);
			isDropdownVisible = false;
		}
	}

  function showDropdown(){
    isDropdownVisible = true;
  }
  
  function hideDropdown(){
    isDropdownVisible = false;
  }

  onMount(() => {
    // โหลดข้อมูลตะกร้าจาก localStorage เมื่อ component โหลด
    cartStore.loadFromStorage();
    
    // ฟัง storage event สำหรับการเปลี่ยนแปลงจากแท็บอื่น
    const handleStorageChange = (event) => {
      if (event.key === 'cartitem') {
        cartStore.refresh();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  });

  onDestroy(() => {
    if (unsubscribeCart) unsubscribeCart();
    if (unsubscribeAuth) unsubscribeAuth();
  });

  function GotoMyDownload() {
    if (authStore.isLoggedIn()) {
      goto('/mydownload');
    } else {
      warningAlert('กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้าดาวน์โหลด');
      goto('/login');
    }
  }
</script>

<nav class="py-3 border-gray-200 border-b-2">
    
  <!-- Top bar for social media and auth links -->
  <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center my-1">

    <!-- Social Media Links -->
    <div class="flex space-x-4 ">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-600 hover:text-violet-600 ">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="16"  height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-facebook"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" /></svg>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-600 hover:text-violet-600">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="16"  height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-instagram"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M16.5 7.5v.01" /></svg>
      </a>
      <a href="https://x.com" target="_blank" rel="noopener noreferrer" class="text-sm text-slate-600 hover:text-violet-600">
        <svg  xmlns="http://www.w3.org/2000/svg"  width="16"  height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
    </a>
    </div>
    
    <!-- Auth Links -->
    <div class="flex space-x-4">
      {#if userProfile}
        <a href="/profile" class="text-xs text-slate-600 hover:text-violet-600">โปรไฟล์ <b class='font-bold'>{userProfile.user_metadata.username|| 'N/A'}</b></a>
      {:else}
        <a href="/signup" class="text-xs text-slate-600 hover:text-violet-600">สมัครสมาชิก</a>
        <a href="/login" class="text-xs text-slate-600 hover:text-violet-600">เข้าสู่ระบบ</a>
      {/if}
    </div>
  </div>

  <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
    <!-- Brand/Logo -->
		<div class="ms-5">
			<a href="/" class="text-2xl font-semibold text-violet-600 ubuntu-regular">Valeria</a>
		</div>
    
    <!-- Search Bar -->
    <div class="relative flex-grow max-w-2xl mx-4"> 
      <input
		type="text"
		placeholder="ค้นหาภาพจาก Pixabay..."
		bind:value={searchValue}
		on:input
    on:focus={showDropdown}
    on:blur={hideDropdown}
		on:keypress={(e) => e.key === 'Enter' && handleSearch()}
		class="w-full pl-4 pr-10 py-2 border border-gray-300 bg-gray-50 text-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
	/>

	<!-- 🔍 ปุ่มค้นหา -->
	<button
		on:click={handleSearch}
		type="button"
		transition:fade={{ duration: 150 }}
		class="absolute inset-y-0 right-0 px-4 flex items-center cursor-pointer bg-violet-500 rounded-r-md"
		aria-label="Search"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
	</button>

      <!-- 🔽 Drop-down Suggestions -->
      {#if isDropdownVisible}
        <ul class="absolute z-20 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg" on:click={() => handleSearch()}>
            <li
              class="px-4 py-2 hover:bg-violet-100 text-sm text-gray-700 cursor-pointer"
              
            >
              ค้นหา {searchValue} จากทั้งหมดที่มี
            </li>
        </ul>
      {/if}
    </div>

    <!-- Icons -->
    <div class="flex max-w-7xl space-x-6 ">
	  <a href="/cart" class="relative text-slate-600 hover:text-violet-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {#if cartItemCount > 0}
        <span 
            class="absolute -top-2 -right-2.5 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center leading-none"
            transition:fade={{ duration: 200 }}
        >
            {cartItemCount > 99 ? '99+' : cartItemCount}
        </span>
       {/if}
      </a>


      <p class="relative text-slate-600 hover:text-violet-600" on:click={GotoMyDownload}>
        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-photo"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8.813 11.612c.457 -.38 .918 -.38 1.386 .011l.108 .098l4.986 4.986l.094 .083a1 1 0 0 0 1.403 -1.403l-.083 -.094l-1.292 -1.293l.292 -.293l.106 -.095c.457 -.38 .918 -.38 1.386 .011l.108 .098l4.674 4.675a4 4 0 0 1 -3.775 3.599l-.206 .005h-12a4 4 0 0 1 -3.98 -3.603l6.687 -6.69l.106 -.095zm9.187 -9.612a4 4 0 0 1 3.995 3.8l.005 .2v9.585l-3.293 -3.292l-.15 -.137c-1.256 -1.095 -2.85 -1.097 -4.096 -.017l-.154 .14l-.307 .306l-2.293 -2.292l-.15 -.137c-1.256 -1.095 -2.85 -1.097 -4.096 -.017l-.154 .14l-5.307 5.306v-9.585a4 4 0 0 1 3.8 -3.995l.2 -.005h12zm-2.99 5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" /></svg>
      </p>
    </div>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
    <p class="text-xs text-slate-600 mx-6 mt-2 hover:text-slate-800 cursor-pointer border-b-2 border-transparent transition delay-50 hover:border-b-violet-500">รูปถ่าย</p>
    <p class="text-xs text-slate-600 mx-6 mt-2 hover:text-slate-800 cursor-pointer border-b-2 border-transparent transition delay-50 hover:border-b-violet-500">ภาพประกอบ</p>
    <p class="text-xs text-slate-600 mx-6 mt-2 hover:text-slate-800 cursor-pointer border-b-2 border-transparent transition delay-50 hover:border-b-violet-500">เวกเตอร์</p>
    <p class="text-xs text-slate-600 mx-6 mt-2 hover:text-slate-800 cursor-pointer border-b-2 border-transparent transition delay-50 hover:border-b-violet-500">วีดีโอ</p>
  </div>
</nav>