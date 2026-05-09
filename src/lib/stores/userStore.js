import { writable } from "svelte/store";

function createPersistentUserStore() {
  const initialUser = null;

  let StoreUser = null;
  if (typeof localStorage !== "undefined") {
    const storedUserJson = localStorage.getItem("currentUser");
    if (storedUserJson) {
      try {
        StoreUser = JSON.parse(storedUserJson);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem("currentUser");
      }
    }
  }

  const { subscribe, set, update } = writable(StoreUser || initialUser);

  return {
    subscribe,
    setUser: (userData) => {
      if (userData) {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("currentUser", JSON.stringify(userData));
        }
        set(userData);
      } else {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("currentUser");
        }
        set(null);
      }
    },
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
        return currentUser;
      });
    },
    clearUser: () => {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("currentUser");
      }
      set(null);
    },
    isLoggedIn: () => {
      return (
        typeof localStorage !== "undefined" &&
        localStorage.getItem("currentUser") !== null
      );
    },
    getuserId: () => {
      const currentUserJson = localStorage.getItem("currentUser");
      const userId = JSON.parse(currentUserJson)?.user.id;
      if (userId) {
        try {
          const currentUser = userId;
          return currentUser || null;
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
          return null;
        }
      }
      return null;
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
