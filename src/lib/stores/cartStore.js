// lib/stores/cartStore.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { successAlert, warningAlert } from '$lib/alertUtils';

function createCartStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    
    // โหลดข้อมูลจาก localStorage
    loadFromStorage: () => {
      if (browser) {
        const stored = localStorage.getItem('cartitem');
        if (stored) {
          try {
            const items = JSON.parse(stored);
            set(Array.isArray(items) ? items : []);
          } catch (e) {
            console.error('Error parsing cart items:', e);
            set([]);
          }
        } else {
          set([]);
        }
      }
    },

    // เพิ่มสินค้าในตะกร้า
    addItem: (item) => update(items => {
      const existingItem = items.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // ถ้าสินค้าอยู่ในตะกร้าแล้ว, แสดง warning และไม่ทำอะไรกับตะกร้า
        warningAlert('สินค้านี้มีอยู่ในตะกร้าแล้ว');
        return items; // คืนค่า items เดิม ไม่มีการเปลี่ยนแปลง
      } else {
        // ถ้าเป็นสินค้าใหม่ เพิ่มเข้าไป (กำหนด quantity เป็น 1)
        const newItem = { ...item, quantity: 1 };
        const newItems = [...items, newItem];
        if (browser) {
          localStorage.setItem('cartitem', JSON.stringify(newItems));
        }
        successAlert('เพิ่มสินค้าในตะกร้าสำเร็จ!');
        return newItems;
      }
    }),

    // ลบสินค้าออกจากตะกร้า
    removeItem: (itemId) => update(items => {
      const newItems = items.filter(item => item.id !== itemId);
      if (browser) {
        localStorage.setItem('cartitem', JSON.stringify(newItems));
      }
      successAlert('ลบสินค้าออกจากตะกร้าสำเร็จ!');
      return newItems;
    }),

    // อัปเดตจำนวนสินค้า
    updateQuantity: (itemId, quantity) => update(items => {
      if (quantity <= 0) {
        // ถ้าจำนวนเป็น 0 หรือน้อยกว่า ให้ลบสินค้าออก
        const newItems = items.filter(item => item.id !== itemId);
        if (browser) {
          localStorage.setItem('cartitem', JSON.stringify(newItems));
        }
        return newItems;
      } else {
        const newItems = items.map(item => 
          item.id === itemId 
            ? { ...item, quantity }
            : item
        );
        if (browser) {
          localStorage.setItem('cartitem', JSON.stringify(newItems));
        }
        return newItems;
      }
    }),

    // ลดจำนวนสินค้า
    decreaseQuantity: (itemId) => update(items => {
      const newItems = items.map(item => {
        if (item.id === itemId) {
          const newQuantity = (item.quantity || 1) - 1;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean); // กรองสินค้าที่เป็น null ออก
      
      if (browser) {
        localStorage.setItem('cartitem', JSON.stringify(newItems));
      }
      return newItems;
    }),

    // เคลียร์ตะกร้าทั้งหมด
    clearCart: () => {
      if (browser) {
        localStorage.removeItem('cartitem');
      }
      set([]);
      //successAlert('ล้างตะกร้าสำเร็จ!');
    },

    // รีเฟรชจาก localStorage (สำหรับกรณีที่มีการเปลี่ยนแปลงจากแหล่งอื่น)
    refresh: () => {
      if (browser) {
        const stored = localStorage.getItem('cartitem');
        if (stored) {
          try {
            const items = JSON.parse(stored);
            set(Array.isArray(items) ? items : []);
          } catch (e) {
            console.error('Error parsing cart items:', e);
            set([]);
          }
        } else {
          set([]);
        }
      }
    }
  };
}

export const cartStore = createCartStore();