<script>
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { StoreUser } from '$lib/stores/userStore'
  import { errorAlert, successAlert } from '$lib/alertUtils';

  let email = '';
  let password = '';
  let loading = false;

  let user = {};
  

    // ฟังก์ชันสำหรับ Login
  async function signIn() {

    try {
      loading = true
      const { data,error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      user = data
      

      if (error) {
        errorAlert(`เกิดข้อผิดพลาด: ${error.message}`)
      } else {
        successAlert('เข้าสู่ระบบสำเร็จ!')
        StoreUser.setUser(user)
        goto('/')
      }
    } catch (error) {
      errorAlert(`เกิดข้อผิดพลาด: ${error.message}`)
    } finally {
      loading = false
    }
  }


</script>

<div class=" flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        เข้าสู่ระบบบัญชีของคุณ
      </h2>
    </div>
    <form class="mt-8 space-y-6" on:submit|preventDefault={signIn}>
      <input type="hidden" name="remember" value="true" />
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email-address" class="sr-only">อีเมล</label>
          <input id="email-address" name="email" type="email" bind:value={email} required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="อีเมล" />
        </div>
        <div>
          <label for="password" class="sr-only">รหัสผ่าน</label>
          <input id="password" name="password" type="password" bind:value={password} required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="รหัสผ่าน" />
        </div>
      </div>

 

      <div>
        <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          เข้าสู่ระบบ
        </button>
      </div>
    </form>
    <div class="text-sm text-center">
      <a href="/signup" class="font-medium text-indigo-600 hover:text-indigo-500">
        ยังไม่มีบัญชี? สร้างบัญชีใหม่
      </a>
    </div>
    <div class="text-sm text-center mt-2">
      <a href="/" class="font-medium text-gray-600 hover:text-indigo-500">
        &larr; กลับไปหน้าหลัก
      </a>
    </div>
  </div>
</div>