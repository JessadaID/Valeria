<script>
  import { supabase } from "$lib/supabaseClient";
  import { StoreUser as authStore } from "$lib/stores/userStore";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // ตัวแปรสำหรับเก็บข้อมูลผู้ใช้จาก store
  let userProfile = null;
  let isLoading = false;
  let showModal = false;
  let name = "";
  // ติดตามการเปลี่ยนแปลงของ user store
  const unsubscribe = authStore.subscribe((storeState) => {
    if (storeState && storeState.user) {
      userProfile = storeState.user;
      name = userProfile?.user_metadata?.username || "";
    } else {
      userProfile = null;
    }
  });

  onMount(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    
  });

  function handleChangePassword() {
    alert("ฟังก์ชันเปลี่ยนรหัสผ่านยังไม่ได้ถูกสร้าง");
  }

  async function handleUpdateProfile() {
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: {
        username: name,
      },
    });
    if (error) {
      alert("เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์: " + error.message);
      return;
    }else{
      authStore.updateUser(user);
      userProfile = user;
      alert("อัปเดตโปรไฟล์สำเร็จ");
      
    }
    showModal = false;
  }

  function handleMyOrders() {
    goto("/profile/myorder");
  }

  async function logout() {
    try {
      isLoading = true;
      await supabase.auth.signOut();
      authStore.clearUser();
      goto("/login");
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการออกจากระบบ: " + error.message);
    } finally {
      isLoading = false;
    }
  }

  // ฟังก์ชันสำหรับสร้างอวตารจากชื่อ
  function getInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getUserDisplayName() {
    if (!userProfile) return "";
    return (
      userProfile.user_metadata?.username ||
      userProfile.user_metadata?.name ||
      (userProfile.user_metadata?.firstName &&
      userProfile.user_metadata?.lastName
        ? `${userProfile.user_metadata.firstName} ${userProfile.user_metadata.lastName}`
        : userProfile.email?.split("@")[0]) ||
      "ผู้ใช้"
    );
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <h1 class="text-2xl font-semibold text-gray-900">บัญชีของฉัน</h1>
        <nav class="hidden md:flex space-x-8">
          <a
            href="/"
            class="text-gray-500 hover:text-gray-900 transition-colors"
            >หน้าแรก</a
          >
          <a
            href="/shop"
            class="text-gray-500 hover:text-gray-900 transition-colors"
            >ร้านค้า</a
          >
          <a
            href="/contact"
            class="text-gray-500 hover:text-gray-900 transition-colors"
            >ติดต่อ</a
          >
        </nav>
      </div>
    </div>
  </div>

  {#if userProfile}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Card -->
        <div class="lg:col-span-1">
          <div
            class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <!-- Profile Header -->
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-center"
            >
              <div
                class="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 mb-4 shadow-lg"
              >
                {getInitials(getUserDisplayName())}
              </div>
              <h2 class="text-xl font-semibold text-white mb-1">
                {getUserDisplayName()}
              </h2>
              <p class="text-blue-100 text-sm">{userProfile.email}</p>
            </div>

            <!-- Profile Info -->
            <div class="p-6 space-y-4">
              <div class="flex items-center text-sm">
                <svg
                  class="w-5 h-5 text-gray-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span class="text-gray-600">สมาชิกตั้งแต่ 2024</span>
              </div>

              {#if userProfile.phone}
                <div class="flex items-center text-sm">
                  <svg
                    class="w-5 h-5 text-gray-400 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span class="text-gray-600">{userProfile.phone}</span>
                </div>
              {/if}

              <div class="flex items-center text-sm">
                <svg
                  class="w-5 h-5 text-gray-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-green-600 font-medium"
                  >บัญชีได้รับการยืนยัน</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Quick Actions -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-6">
              การดำเนินการด่วน
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                on:click={handleMyOrders}
                class="group flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
              >
                <div
                  class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors"
                >
                  <svg
                    class="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div class="ml-4 text-left">
                  <h4 class="font-medium text-gray-900">ออเดอร์ของฉัน</h4>
                  <p class="text-sm text-gray-500">ดูประวัติการสั่งซื้อ</p>
                </div>
              </button>

              <button
                on:click={() => (showModal = true)}
                class="group flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-200"
              >
                <div
                  class="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors"
                >
                  <svg
                    class="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div class="ml-4 text-left">
                  <h4 class="font-medium text-gray-900">แก้ไขโปรไฟล์</h4>
                  <p class="text-sm text-gray-500">อัปเดตข้อมูลส่วนตัว</p>
                </div>
              </button>

              <button
                on:click={handleChangePassword}
                class="group flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-yellow-200 hover:bg-yellow-50 transition-all duration-200"
              >
                <div
                  class="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors"
                >
                  <svg
                    class="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div class="ml-4 text-left">
                  <h4 class="font-medium text-gray-900">เปลี่ยนรหัสผ่าน</h4>
                  <p class="text-sm text-gray-500">อัปเดตรหัสผ่าน</p>
                </div>
              </button>

              <button
                on:click={logout}
                class="group flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-200"
              >
                <div
                  class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors"
                >
                  <svg
                    class="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div class="ml-4 text-left">
                  <h4 class="font-medium text-gray-900">
                    {isLoading ? "กำลังออกจากบัญชี..." : "ออกจากบัญชี "}
                  </h4>
                  <p class="text-sm text-gray-500">ออกจากบัญชี</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Account Information -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-6">
              ข้อมูลบัญชี
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1"
                    >ชื่อผู้ใช้</label
                  >
                  <p class="text-gray-900 font-medium">
                    {getUserDisplayName()}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1"
                    >อีเมล</label
                  >
                  <p class="text-gray-900">{userProfile.email || "ไม่ระบุ"}</p>
                </div>
              </div>

              <div class="space-y-4">
                {#if userProfile.user_metadata?.firstName && userProfile.user_metadata?.lastName}
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-1"
                      >ชื่อ-นามสกุล</label
                    >
                    <p class="text-gray-900">
                      {userProfile.user_metadata.firstName}
                      {userProfile.user_metadata.lastName}
                    </p>
                  </div>
                {/if}

                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-1"
                    >เบอร์โทรศัพท์</label
                  >
                  <p class="text-gray-900">{userProfile.phone || "ไม่ระบุ"}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-6">
              ความปลอดภัย
            </h3>

            <div class="space-y-4">
              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <svg
                    class="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">
                      อีเมลได้รับการยืนยัน
                    </p>
                    <p class="text-sm text-gray-500">บัญชีของคุณปลอดภัย</p>
                  </div>
                </div>
              </div>

              <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <svg
                    class="w-5 h-5 text-blue-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">รหัสผ่าน</p>
                    <p class="text-sm text-gray-500">
                      อัปเดตล่าสุด 30 วันที่แล้ว
                    </p>
                  </div>
                </div>
                <button
                  on:click={handleChangePassword}
                  class="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  เปลี่ยน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Not Logged In State -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <div
          class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8"
        >
          <svg
            class="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4">ยินดีต้อนรับ!</h2>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          เข้าสู่ระบบเพื่อเข้าถึงโปรไฟล์ของคุณ จัดการออเดอร์
          และติดตามการสั่งซื้อ
        </p>
        <div class="space-x-4">
          <a
            href="/login"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            เข้าสู่ระบบ
          </a>
          <a
            href="/register"
            class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            สมัครสมาชิก
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>

{#if showModal}
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    on:click={() => (showModal = false)}
  >
    <!-- modal content -->
    <div
      class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
      on:click|stopPropagation
    >
      <h2 class="text-xl font-semibold mb-4">แก้ไขโปรไฟล์</h2>

      <label for="name">ชื่อผู้ใช้</label>
      <input
        id="name"
        type="text"
        class="w-full border border-gray-300 rounded-lg p-2 mb-4"
        placeholder="ชื่อผู้ใช้"
        bind:value={name}
      />

      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        on:click={() => handleUpdateProfile()}
      >
        บันทึก
      </button>

      <button
        on:click={() => (showModal = false)}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        ปิด
      </button>
    </div>
  </div>
{/if}
