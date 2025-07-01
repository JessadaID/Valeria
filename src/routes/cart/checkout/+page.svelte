<script>
  export let data; // รับค่าจาก load function ใน +page.server.js
  let amount = data.amount;
  let orderId = data.sessionId;
  let promptpayId = data.promptpayId;
  let qrCodeDataUrl = data.qrCodeDataUrl;

  let selectedFile = null;
  let previewUrl = null;
  
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      selectedFile = file;
      
      // สร้าง preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    }
  }

  function clearSlip() {
    selectedFile = null;
    previewUrl = null;
    
    // รีเซ็ต input file
    const fileInput = document.getElementById('slipInput');
    if (fileInput) fileInput.value = '';
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6 text-center">หน้าชำระเงิน</h1>

  <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
    <div class="mb-6 text-center">
      <h2 class="text-xl font-semibold mb-2">รายละเอียดการชำระเงิน</h2>
      <p class="text-gray-700">จำนวนเงินที่ต้องชำระ: <span class="font-bold text-green-600">{amount ? amount.toFixed(2) : 'N/A'} บาท</span></p>
      <p class="text-gray-600 text-sm">หมายเลขคำสั่งซื้อ: {orderId || 'ไม่มี'}</p>
      <p class="text-gray-600 text-sm">PromptPay ID ผู้รับ: {promptpayId}</p>
    </div>

    {#if qrCodeDataUrl}
      <div class="flex justify-center mb-6">
        <img src={qrCodeDataUrl} alt="QR Code for Payment" class="w-64 h-64 border border-gray-300 p-2 rounded-md">
      </div>

      <div class="text-center mb-6">
        <p class="text-lg font-semibold mb-2">สแกน QR Code เพื่อชำระเงิน</p>
        <p class="text-gray-600 text-sm">ใช้แอปพลิเคชันธนาคารของคุณเพื่อสแกน QR Code ด้านบน</p>
      </div>
    {:else}
      <div class="flex justify-center items-center h-64">
        <p class="text-gray-600">กำลังสร้าง QR Code...</p>
      </div>
    {/if}

    <!-- ส่วนอัปโหลดสลิป -->
    <div class="border-t border-gray-200 pt-6 mt-6">
      <h3 class="text-lg font-semibold mb-4 text-center">ตรวจสอบสลิปการโอนเงิน</h3>
      
      <div class="mb-4">
        <label for="slipInput" class="block text-sm font-medium text-gray-700 mb-2">
          แนบสลิปการโอนเงิน
        </label>
        <input
          id="slipInput"
          type="file"
          accept="image/*"
          on:change={handleFileSelect}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {#if previewUrl}
        <div class="mb-4">
          <img src={previewUrl} alt="Slip Preview" class="w-full max-w-xs mx-auto rounded-md border">
        </div>
      {/if}

    </div>

    <div class="mt-6 text-center border-t border-gray-200 pt-4">
      {#if selectedFile}
        <p class="text-sm text-gray-600 mb-2">คุณได้แนบสลิปแล้ว กรุณารอการตรวจสอบจากผู้ดูแลระบบ</p>
          <button
            on:click={clearSlip}
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            ล้าง
          </button>
        {/if}
    </div>
  </div>

  <div class="mt-8 text-center text-gray-600 text-sm">
    <p>หากมีปัญหาในการชำระเงิน กรุณาติดต่อฝ่ายบริการลูกค้า</p>
    <p>โทร: 095-123-6881</p>
    <p>นายเจษฎา บุญทา</p>
  </div>
</div>