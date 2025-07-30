<script>
  import { onMount } from "svelte";
  import { goto } from '$app/navigation';
  import { errorAlert, successAlert, warningAlert } from "$lib/alertUtils";
  import { cartStore } from "$lib/stores/cartStore";
  import { StoreUser } from "$lib/stores/userStore";
  import { formatFileSize } from "$lib/formatFilesize";

  let itemcart = [];

  const PRICE = 29;
  const TAX = 0.07;
  let isLoading = false;
  
  // Calculate totals
  $: subtotal = itemcart.reduce((sum, item) => {
    const price = item.price || PRICE; // Default price if not set
    return sum + price;
  }, 0);

  $: tax = subtotal * TAX; // 7% tax
  $: total = subtotal + tax;


  async function insertOrder(){
    try {
      isLoading = true;
      const response = await fetch('/api/v1/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: StoreUser.getuserId(),
          totalamount: total,
          status : 'paid',
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มรายการสั่งซื้อ');
      }else{
        const orderData = await response.json();
        const orderId = orderData.id; // Get the newly created order ID

        // Insert each item into the orderitems table
        for (const item of itemcart) {
          await insertOrderItem(orderId, item);
        }

        // Clear the cart after successful order creation
        itemcart = [];
        cartStore.clearCart();
        localStorage.setItem("cartitem", JSON.stringify([]));

        //successAlert('เพิ่มรายการสั่งซื้อสำเร็จ');
      }
    } catch (error) {
      console.error('Error inserting order item:', error);
      errorAlert('เกิดข้อผิดพลาดในการเพิ่มรายการสั่งซื้อ');
    }finally{
      isLoading = false;
    }
  }

  async function insertOrderItem(orderId, item) {
    try {
      isLoading = true;
      const response = await fetch('/api/v1/orderitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          imageId: item.id,
          price: item.price || PRICE,
          type: item.type || 'photo',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มรายการสั่งซื้อ');
      }
    } catch (error) {
      console.error('Error inserting order item:', error);
      errorAlert('เกิดข้อผิดพลาดในการเพิ่มรายการสั่งซื้อ');
    }finally{
      isLoading = false;
    }
  }

  onMount(() => {
    const storedCart = localStorage.getItem("cartitem");
    //console.log("Stored cart items:", JSON.parse(storedCart));
    if (storedCart) {
      try {
        const parsedItems = JSON.parse(storedCart);
        if (Array.isArray(parsedItems)) {
          itemcart = parsedItems;
        } else {
          console.warn("Cart data in localStorage is not an array. Resetting cart.");
          itemcart = [];
          localStorage.setItem("cartitem", JSON.stringify([]));
        }
      } catch (error) {
        console.error("Error parsing cart items from localStorage:", error);
        itemcart = [];
        localStorage.setItem("cartitem", JSON.stringify([]));
      }
    } else {
      itemcart = [];
    }
  });

  function removeItem(itemId) {
    itemcart = itemcart.filter(item => item.id !== itemId);
    cartStore.removeItem(itemId);
  }

  function viewDetails(itemId , types='all') {
    if(types == 'video'){
      goto(`/product?id=${itemId}&type=video`);
    }else{
      goto(`/product?id=${itemId}`);
    }
  }

  async function proceedToCheckout() {
    if (StoreUser.isLoggedIn()){
      // Handle checkout logic here
      try {
        isLoading = true; 
        const response = await fetch('/api/v1/createpaymentsession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          const errorData = await response.json();
          errorAlert(errorData.message || 'เกิดข้อผิดพลาดในการสร้างการชำระเงิน');
          throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการสร้างเซสชันชำระเงิน');
        }else{
          // Insert order and order items

          await insertOrder();
          
          goto(`./cart/checkout?sessionId=${data.paymentSessionId}`);
        }

        // 2. นำทางไปยังหน้า QR Code พร้อมส่ง paymentSessionId
      }catch (error) {
        console.error('Error creating payment session:', error);
        errorAlert('เกิดข้อผิดพลาดในการสร้างการชำระเงิน ');
      }finally{
        isLoading = false;
      }
    }else{
      warningAlert("กรุณาเข้าสู่ระบบเพื่อใช้งาน");
      goto("/login");
    }
  }

</script>


<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">ตะกร้าสินค้า</h1>
      <p class="text-gray-600 mt-2">จัดการสินค้าและดำเนินการชำระเงิน</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items Section -->
      <div class="lg:col-span-2">
        {#if itemcart.length > 0}
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">
                สินค้าในตะกร้า ({itemcart.length} ไฟล์)
              </h2>
            </div>
            
            <div class="divide-y divide-gray-200">
              {#each itemcart as item (item.id)}
                <div class="p-6 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start space-x-4">
                    <!-- Product Image -->
                    <div class="flex-shrink-0">
                      {#if item.type == 'film'}
                        <img 
                          on:click={() => viewDetails(item.id,'video')}
                          src="{item.videos.tiny.thumbnail}" 
                          alt="{item.tags || 'Product Image'}" 
                          class="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      {:else}
                        <img 
                          on:click={() => viewDetails(item.id)}
                          src="{item.previewURL}" 
                          alt="{item.tags || 'Product Image'}" 
                          class="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      {/if}
                      
                    </div>
                    
                    <!-- Product Details -->
                    <div class="flex-grow min-w-0">
                      <h3 class="text-lg font-medium text-gray-900 mb-1">
                        Image ID: {item.id}
                      </h3>
                      
                      <div class="space-y-1 text-sm text-gray-500">
                        <p>ประเภท: <span class="font-medium">{item.type}</span></p>
                        <p>ลิขสิทธิ์: 
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            ใช้งานเชิงพาณิชย์ได้
                          </span>
                        </p>
                        <p>AI Training: 
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {!item.noAiTraining ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                            {!item.noAiTraining ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </p>
                        {#if item.imageSize}
                          <p>ขนาด: {item.imageHeight} x {item.imageWidth} | {formatFileSize(item.imageSize)}</p>
                        {/if}
                      </div>
                      

                    </div>
                    
                    <!-- Price and Actions -->
                    <div class="flex flex-col items-end space-y-2">
                      <div class="text-right">
                        <p class="text-lg font-semibold text-gray-900">
                          ฿{(item.price || 29).toLocaleString()}
                        </p>
                        <p class="text-sm text-gray-500">ไฟล์ดิจิทัล</p>
                      </div>
                      
                      <button 
                        on:click={() => removeItem(item.id)}
                        class="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <!-- Empty Cart State -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart-plus mx-auto h-16 w-16 text-gray-300 mb-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M12.5 17h-6.5v-14h-2" /><path d="M6 5l14 1l-.86 6.017m-2.64 .983h-10.5" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">ตะกร้าสินค้าว่างเปล่า</h3>
            <p class="text-gray-600 mb-6">ยังไม่มีสินค้าในตะกร้าของคุณ เริ่มช็อปปิ้งเลย!</p>
            <a href="/" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              เริ่มช็อปปิ้ง
            </a>
          </div>
        {/if}
      </div>

      <!-- Checkout Section -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">สรุปคำสั่งซื้อ</h2>
          </div>
          
          <div class="p-6">
            <!-- Order Summary -->
              <div class="space-y-3 mb-6">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ยอดรวมสินค้า ({itemcart.length} ไฟล์)</span>
                  <span class="font-medium">฿{subtotal.toLocaleString()}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ภาษี (7%)</span>
                  <span class="font-medium">฿{tax.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">ดาวน์โหลดทันที</span>
                  <span class="font-medium text-green-600">✓</span>
                </div>
                <div class="border-t border-gray-200 pt-3">
                  <div class="flex justify-between">
                    <span class="text-base font-semibold text-gray-900">ยอดรวมทั้งหมด</span>
                    <span class="text-xl font-bold text-gray-900">฿{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            <!-- Promo Code 
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">รหัสส่วนลด</label>
              <div class="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="กรอกรหัสส่วนลด"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors">
                  ใช้
                </button>
              </div>
            </div>
              -->


            <!-- Checkout Button -->
            <button 
              on:click={proceedToCheckout}
              disabled={itemcart.length === 0}
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {#if itemcart.length > 0}
                {#if isLoading}
                  <span>กำลังดำเนินการ...</span>
                {:else}
                  <span>ดำเนินการชำระเงิน</span>
                {/if}
              {:else}
                ตะกร้าว่างเปล่า
              {/if}
            </button>

            <!-- Security Badge -->
            <div class="mt-4 flex items-center justify-center text-xs text-gray-500">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              การชำระเงินปลอดภัย SSL
            </div>
          </div>
        </div>

        <!-- Digital Download Info -->
        <div class="mt-6 bg-green-50 rounded-xl p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
            </svg>
            <div>
              <h3 class="text-sm font-medium text-green-900 mb-1">การดาวน์โหลดไฟล์</h3>
              <p class="text-xs text-green-700">ดาวน์โหลดไฟล์ได้ทันทีหลังชำระเงิน</p>
              <p class="text-xs text-green-700">ไฟล์ความละเอียดสูง รองรับการใช้งานเชิงพาณิชย์</p>
              <p class="text-xs text-green-700">สามารถดาวน์โหลดซ้ำได้ใน 30 วัน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>