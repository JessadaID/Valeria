<script>
  import { successAlert } from '$lib/alertUtils.js';
  import { onMount } from 'svelte';
  export let data; // รับค่าจาก load function ใน +page.server.js
  let amount = data.amount;
  let orderId = data.sessionId;
  let promptpayId = data.promptpayId;
  let qrCodeDataUrl = data.qrCodeDataUrl;

  onMount(() => {
    successAlert('ชำระเงินสำเร็จ');
  });


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

  </div>

  <div class="mt-8 text-center text-gray-600 text-sm">
    <p>หากมีปัญหาในการชำระเงิน กรุณาติดต่อฝ่ายบริการลูกค้า</p>
    <p>โทร: 095-123-6881</p>
    <p>นายเจษฎา บุญทา</p>
  </div>
</div>