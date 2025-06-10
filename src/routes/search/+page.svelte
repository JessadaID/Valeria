<script>
  import { page } from "$app/stores"; // แก้ไข: import จาก $app/stores แทน $app/state
  import MasonryGallery from "$lib/component/MasonryGallery.svelte";
  import { onMount } from "svelte";
  // $: ทำให้ query อัปเดตอัตโนมัติเมื่อ $page.url.searchParams เปลี่ยนแปลง
  $: query = $page.url.searchParams.get('q'); 

  const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

  let goods = [];

   onMount( async () => {
     const respond = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q==${query}&image_type=photo&per_page=20`);
    const data = await respond.json();
    goods = data;
   })
  

</script>

<div class="p-4">
    <h1 class="text-4xl py-5">{goods.total} รูปภาพฟรีของ {query}</h1>
  <MasonryGallery goods={goods.hits} />
</div>
