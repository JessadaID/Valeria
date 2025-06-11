<script>
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { StoreUser as authStore } from '$lib/stores/userStore'

  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let errorMessage = '';
  let successMessage = '';

  async function handleSignup() {
    errorMessage = '';
    successMessage = '';

    if (!username || !email || !password || !confirmPassword) {
      errorMessage = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
      return;
    }
    if (password !== confirmPassword) {
      errorMessage = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน';
      return;
    }
    if (password.length < 6) {
      errorMessage = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error){
        errorMessage = 'เกิดข้อผิดพลาดในการสร้างบัญชี: ' + error.message;
      }else{
        alert('สร้างบัญชีสำเร็จ')
      }

    } catch (error) {
      errorMessage = 'เกิดข้อผิดพลาดในการสร้างบัญชี: ' + error.message;
    }

    
  }
</script>

<div class="flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        สร้างบัญชีใหม่
      </h2>
    </div>
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleSignup}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">ชื่อผู้ใช้</label>
          <input id="username" name="username" type="text" bind:value={username} required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="ชื่อผู้ใช้" />
        </div>
        <div>
          <label for="email-address" class="sr-only">อีเมล</label>
          <input id="email-address" name="email" type="email" bind:value={email} required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="อีเมล" />
        </div>
        <div>
          <label for="password" class="sr-only">รหัสผ่าน</label>
          <input id="password" name="password" type="password" bind:value={password} required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" />
        </div>
        <div>
          <label for="confirm-password" class="sr-only">ยืนยันรหัสผ่าน</label>
          <input id="confirm-password" name="confirm-password" type="password" bind:value={confirmPassword} required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="ยืนยันรหัสผ่าน" />
        </div>
      </div>

      {#if errorMessage}
        <p class="text-sm text-red-600 text-center">{errorMessage}</p>
      {/if}
      {#if successMessage && !errorMessage}
        <p class="text-sm text-green-600 text-center">{successMessage}</p>
      {/if}

      <div>
        <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          สร้างบัญชี
        </button>
      </div>
    </form>
    <div class="text-sm text-center">
      <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
        มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
      </a>
    </div>
     <div class="text-sm text-center mt-2">
      <a href="/" class="font-medium text-gray-600 hover:text-indigo-500">
        &larr; กลับไปหน้าหลัก
      </a>
    </div>
  </div>
</div>