import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { successAlert, warningAlert } from '$lib/alertUtils';
import { StoreUser } from '$lib/stores/userStore';

/**
 * @typedef {Object} CartItem
 * @property {string|number} id
 * @property {string} [name]
 * @property {number} [price]
 * @property {number} [quantity]
 * @property {string} [webformatURL]
 * @property {string} [type]
 */

function createCartStore() {
  /** @type {import('svelte/store').Writable<CartItem[]>} */
  const { subscribe, set, update } = writable([]);

  /**
   * Sync data with Redis if user is logged in
   * @param {CartItem[]} items 
   */
  const syncWithRedis = async (items) => {
    if (!browser) return;
    const userData = get(StoreUser);

    const email = userData?.user?.email || userData?.email;

    if (email) {
      try {
        await fetch('/api/v1/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, items })
        });
      } catch (e) {
        console.error('Failed to sync cart with Redis:', e);
      }
    }
  };

  return {
    subscribe,

    /**
     * Load cart from Redis (No LocalStorage)
     * @param {string} email 
     */
    loadFromRedis: async (email) => {
      if (!browser || !email) return;
      try {
        const response = await fetch(`/api/v1/cart?email=${email}`);
        if (response.ok) {
          const items = await response.json();
          if (Array.isArray(items)) {
            set(items);
          }
        }
      } catch (e) {
        console.error('Error loading cart from Redis:', e);
      }
    },

    /**
     * Add item to cart (Only if logged in)
     * @param {CartItem} item 
     */
    addItem: (item) => {
      const userData = get(StoreUser);
      if (!userData) {
        warningAlert('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
        return;
      }

      update(items => {
        const existingItem = items.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
          warningAlert('สินค้านี้มีอยู่ในตะกร้าแล้ว');
          return items;
        } else {
          const newItem = { ...item, quantity: 1 };
          const newItems = [...items, newItem];
          syncWithRedis(newItems);
          successAlert('เพิ่มสินค้าในตะกร้าสำเร็จ!');
          return newItems;
        }
      });
    },

    /**
     * @param {string|number} itemId 
     */
    removeItem: (itemId) => update(items => {
      const newItems = items.filter(item => item.id !== itemId);
      syncWithRedis(newItems);
      successAlert('ลบสินค้าออกจากตะกร้าสำเร็จ!');
      return newItems;
    }),

    /**
     * @param {string|number} itemId 
     * @param {number} quantity 
     */
    updateQuantity: (itemId, quantity) => update(items => {
      /** @type {CartItem[]} */
      let newItems;
      if (quantity <= 0) {
        newItems = items.filter(item => item.id !== itemId);
      } else {
        newItems = items.map(item =>
          item.id === itemId
            ? { ...item, quantity }
            : item
        );
      }

      syncWithRedis(newItems);
      return newItems;
    }),

    /**
     * @param {string|number} itemId 
     */
    decreaseQuantity: (itemId) => update(items => {
      const newItems = items.map(item => {
        if (item.id === itemId) {
          const newQuantity = (item.quantity || 1) - 1;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(item => item !== null);

      syncWithRedis(newItems);
      return newItems;
    }),

    clearCart: () => {
      syncWithRedis([]);
      set([]);
    },

    reset: () => {
      set([]);
    }
  };
}

export const cartStore = createCartStore();