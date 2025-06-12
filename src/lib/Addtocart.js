import { successAlert, warningAlert } from "./alertUtils";

export   function Addtocart (itemToAdd) {
    const storedCart = localStorage.getItem("cartitem");
    let cart = [];

    if (storedCart) {
      try {
        const parsedItems = JSON.parse(storedCart);
        if (Array.isArray(parsedItems)) {
          cart = parsedItems;
        } else {
          console.warn("Cart data in localStorage is not an array. Initializing a new cart.");

          // cart remains []
        }
      } catch (error) {
        console.error("Error parsing cart items from localStorage:", error);

        // cart remains []
      }
    }

    const isAlreadyInCart = cart.some(cartItem => cartItem.id === itemToAdd.id);

    if (isAlreadyInCart) {
      warningAlert("เตือน: สินค้านี้มีอยู่ในตะกร้าแล้ว");
    } else {
      cart.push(itemToAdd); // Add the whole item object
        localStorage.setItem("cartitem", JSON.stringify(cart));
      successAlert("เพิ่มสินค้าในตะกร้าสำเร็จ!");
    }
  }