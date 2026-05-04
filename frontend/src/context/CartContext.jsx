import { createContext, useContext, useEffect, useState } from "react";
import { v4 } from "uuid"; // ✅ Vite compatible UUID

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add product to cart
  const addToCart = (product) => {
    // strict validation: don't allow adding to cart if product requires size/color but it's not provided
    if (product.sizes?.length > 0 && !product.size) {
      return;
    }
    if (product.colors?.length > 0 && !product.color) {
      return;
    }

    setCart((prev) => {
      const exists = prev.find(
        (item) =>
          item._id === product._id &&
          item.size === product.size &&
          item.color === product.color
      );

      if (exists) {
        return prev.map((item) =>
          item === exists
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity: product.quantity || 1,
          cartId: v4(), // ✅ UUID generate
        },
      ];
    });
  };

  // Remove product from cart
  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // Update quantity
  const updateQuantity = (cartId, quantity) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart (after successful payment)
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart context
export const useCart = () => useContext(CartContext);
