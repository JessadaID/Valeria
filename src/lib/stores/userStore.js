import { writable } from "svelte/store";

// ฟังก์ชันสำหรับโหลดข้อมูลผู้ใช้จาก localStorage (ถ้ามี)
// เพื่อให้สถานะการล็อกอินคงอยู่แม้จะรีเฟรชหน้า
function createPersistentUserStore() {
  const initialUser = null; // ค่าเริ่มต้นเมื่อยังไม่มีผู้ใช้ล็อกอิน

  // ลองโหลดข้อมูลผู้ใช้จาก localStorage ตอนเริ่มต้น
  // ในแอปพลิเคชันจริง คุณอาจจะเก็บ token หรือ ID แล้ว fetch ข้อมูลผู้ใช้
  // แต่เพื่อความง่าย จะสมมติว่าเก็บ object ผู้ใช้โดยตรง (ไม่แนะนำสำหรับข้อมูล sensitive ใน production)
  let StoreUser = null;
  if (typeof localStorage !== "undefined") {
    const storedUserJson = localStorage.getItem("currentUser");
    if (storedUserJson) {
      try {
        StoreUser = JSON.parse(storedUserJson);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem("currentUser"); // ลบข้อมูลที่เสียหาย
      }
    }
  }

  const { subscribe, set, update } = writable(StoreUser || initialUser);

  return {
    subscribe,
    // ฟังก์ชันสำหรับตั้งค่าผู้ใช้ (เช่น หลังจากการล็อกอิน)
    setUser: (userData) => {
      if (userData) {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("currentUser", JSON.stringify(userData));
        }
        set(userData);
      } else {
        // ถ้า userData เป็น null หรือ undefined หมายถึงการ logout
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("currentUser");
        }
        set(null);
      }
    },
    // ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้บางส่วน
    updateUser: (updateData) => {
      update((currentUser) => {
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updateData };
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          }
          console.log("Updated user:", updatedUser);
          return updatedUser;
        }
        return currentUser; // หรือจะ return null ถ้าไม่มี currentUser ก็ได้
      });
    },
    // ฟังก์ชันสำหรับเคลียร์ข้อมูลผู้ใช้ (เช่น การล็อกเอาท์)
    clearUser: () => {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("currentUser");
      }
      set(null);
    },
    // ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
    isLoggedIn: () => {
      return (
        typeof localStorage !== "undefined" &&
        localStorage.getItem("currentUser") !== null
      );
    },
    getuserId: () => {
      const currentUserJson = localStorage.getItem("currentUser");
      const userId = JSON.parse(currentUserJson)?.user.id; // สมมติว่า user มี property id
      if (userId) {
        try {
          const currentUser = userId;
          return currentUser || null; // คืนค่า id ถ้ามี ไม่งั้นคืน null
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
          return null; // ถ้าเกิดข้อผิดพลาดในการแปลง JSON
        }
      }
      return null; // ถ้าไม่มีข้อมูลผู้ใช้ใน localStorage
    },
    unsubscribe: () => {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("currentUser");
      }
      set(null);
    },
  };
}

export const StoreUser = createPersistentUserStore();

// ตัวอย่างโครงสร้างข้อมูล user ที่อาจจะเป็นไปได้
// user.set({
//   id: '123',
//   username: 'jessada',
//   email: 'jessada@example.com',
//   firstName: 'Jessada',
//   lastName: 'T.',
//   // ... other properties
// });

// user.clearUser(); // สำหรับ logout
