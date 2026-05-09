
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { successAlert, warningAlert } from '$lib/alertUtils';

function createCartStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,

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

    addItem: (item) => update(items => {
      const existingItem = items.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        warningAlert('สินค้านี้มีอยู่ในตะกร้าแล้ว');
        return items;
      } else {
        const newItem = { ...item, quantity: 1 };
        const newItems = [...items, newItem];
        if (browser) {
          localStorage.setItem('cartitem', JSON.stringify(newItems));
        }
        successAlert('เพิ่มสินค้าในตะกร้าสำเร็จ!');
        return newItems;
      }
    }),

    removeItem: (itemId) => update(items => {
      const newItems = items.filter(item => item.id !== itemId);
      if (browser) {
        localStorage.setItem('cartitem', JSON.stringify(newItems));
      }
      successAlert('ลบสินค้าออกจากตะกร้าสำเร็จ!');
      return newItems;
    }),

    updateQuantity: (itemId, quantity) => update(items => {
      if (quantity <= 0) {
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

    decreaseQuantity: (itemId) => update(items => {
      const newItems = items.map(item => {
        if (item.id === itemId) {
          const newQuantity = (item.quantity || 1) - 1;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean);

      if (browser) {
        localStorage.setItem('cartitem', JSON.stringify(newItems));
      }
      return newItems;
    }),

    clearCart: () => {
      if (browser) {
        localStorage.removeItem('cartitem');
      }
      set([]);
    },

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