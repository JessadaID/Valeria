<script>
  import { supabase } from '$lib/supabaseClient';
  import { StoreUser as authStore } from '$lib/stores/userStore'; 
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // ตัวแปรสำหรับเก็บข้อมูลผู้ใช้จาก store
  let userProfile = null; // ตัวแปรนี้จะเก็บอ็อบเจ็กต์ user จริงๆ (เช่น JSON ที่ให้มาในโจทย์)

  // ติดตามการเปลี่ยนแปลงของ user store
  // authStore จะมีค่าเป็นอ็อบเจ็กต์ { user: UserObject, session: SessionObject }
  const unsubscribe = authStore.subscribe(storeState => {
    if (storeState && storeState.user) {
      userProfile = storeState.user; // ดึงอ็อบเจ็กต์ user ออกมา
    } else {
      userProfile = null; // กรณีที่ยังไม่ได้ login หรือ store ว่างเปล่า
    }
  });

  onMount(() => {
    // ยกเลิกการ subscribe เมื่อ component ถูก unmount เพื่อป้องกัน memory leaks
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  });

  // ฟังก์ชันตัวอย่างสำหรับการจัดการผู้ใช้
  function handleChangePassword() {
    alert('ฟังก์ชันเปลี่ยนรหัสผ่านยังไม่ได้ถูกสร้าง');
    // ในอนาคต: สามารถ navigate ไปยังหน้าเปลี่ยนรหัสผ่าน หรือแสดง modal
  }

  function handleUpdateProfile() {
    alert('ฟังก์ชันอัปเดตโปรไฟล์ยังไม่ได้ถูกสร้าง');
    // ในอนาคต: สามารถแสดง form สำหรับแก้ไขข้อมูล หรือ navigate ไปยังหน้าแก้ไข
  }
  async function logout() {
    try {
      await supabase.auth.signOut();
      authStore.clearUser();
      goto('/login');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการออกจากระบบ: ' + error.message);
    }
  }

</script>

<div class="container mx-auto p-4 md:p-8">
  <h1 class="text-3xl font-bold mb-6 text-center">โปรไฟล์ของฉัน</h1>

  {#if userProfile}
    <div class="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
      <div class="mb-4">
        <strong class="block text-gray-700">ชื่อผู้ใช้:</strong>
        <!-- เข้าถึง user_metadata สำหรับ username/name, หากไม่มีให้ใช้ email แทน -->
        <span class="text-gray-900">{userProfile.user_metadata?.username || userProfile.user_metadata?.name || userProfile.email || 'N/A'}</span>
      </div>
      <div class="mb-4">
        <strong class="block text-gray-700">อีเมล:</strong>
        <span class="text-gray-900">{userProfile.email || 'N/A'}</span>
      </div>
      
      {#if userProfile.user_metadata?.firstName && userProfile.user_metadata?.lastName}
        <div class="mb-4">
          <strong class="block text-gray-700">ชื่อ-นามสกุล:</strong>
          <span class="text-gray-900">{userProfile.user_metadata.firstName} {userProfile.user_metadata.lastName}</span>
        </div>
      {/if}

      <!-- เพิ่มข้อมูลอื่นๆ ที่ต้องการแสดงได้ที่นี่ -->
      
      <div class="mb-4">
        <strong class="block text-gray-700">เบอร์โทรศัพท์:</strong>
        <span class="text-gray-900">{userProfile.phone || 'N/A'}</span>
      </div>
      

      <div class="mt-8 border-t pt-6">
        <h2 class="text-xl font-semibold mb-4">จัดการบัญชี</h2>
        <div class="space-y-3">
          <button 
            on:click={handleUpdateProfile}
            class="w-full border-2 border-blue-500 hover:bg-blue-600 text-blue-500 hover:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            แก้ไขข้อมูลส่วนตัว
          </button>
          <button 
            on:click={handleChangePassword}
            class="w-full border-2 border-orange-500 hover:bg-orange-600 text-orange-500 hover:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            เปลี่ยนรหัสผ่าน
          </button>
          <button 
            on:click={logout}
            class="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            ออกจากระบบ
          </button>

          <!-- เพิ่มปุ่มจัดการอื่นๆ ตามต้องการ -->
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-10">
      <p class="text-xl text-gray-600 mb-4">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์ของคุณ</p>
      <a href="/login" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        ไปหน้าเข้าสู่ระบบ
      </a>
    </div>
  {/if}
</div>

<style>
  /* สามารถเพิ่ม CSS ที่นี่ถ้าต้องการ หรือใช้ Tailwind CSS utility classes โดยตรงใน HTML */
  /* ตัวอย่างการใช้ Tailwind CSS ถูกใส่ไว้ใน HTML แล้ว */
</style>