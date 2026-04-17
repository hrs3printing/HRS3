import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getCart, addItem, updateItem, removeItem } from "../api/cartApi";
import api from "../api/axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      setCart([...(data.items || [])]);
    } catch (error) {
      if (error.response?.status === 401) {
        setCart([]);
      } else if (import.meta.env.DEV) {
        console.error("Fetch cart failed", error);
      }
    }
  }, []);

  const syncCartWithSession = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/session");
      if (data?.authenticated) {
        await fetchCart();
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }
  }, [fetchCart]);

  useEffect(() => {
    const t = setTimeout(() => {
      void syncCartWithSession();
    }, 0);
    return () => clearTimeout(t);
  }, [syncCartWithSession]);

  useEffect(() => {
    const handleUserChange = async () => {
      void syncCartWithSession();
    };

    window.addEventListener("userChanged", handleUserChange);
    return () => window.removeEventListener("userChanged", handleUserChange);
  }, [syncCartWithSession]);

  const addToCart = useCallback(async (productId, qty = 1, options = {}) => {
    try {
      const data = await addItem(productId, qty, options);
      setCart([...(data.items || [])]);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Add to cart error:", error);
      throw error;
    }
  }, []);

  const updateQty = useCallback(async (productId, type) => {
    // Optimistic update
    setCart((prev) =>
      prev.map((item) => {
        if (item.product?._id === productId) {
          const newQty =
            type === "inc" ? item.qty + 1 : Math.max(1, item.qty - 1);
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );

    try {
      const data = await updateItem(productId, type);
      setCart([...(data.items || [])]);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Update cart error:", error);
      // Rollback on error
      void fetchCart();
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    // Optimistic update
    setCart((prev) => prev.filter((item) => item.product?._id !== productId));

    try {
      const data = await removeItem(productId);
      setCart([...(data.items || [])]);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Remove item error:", error);
      // Rollback on error
      void fetchCart();
    }
  }, [fetchCart]);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (item.product?.price || 0) * (item.qty || 0),
        0,
      ),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      updateQty,
      removeFromCart,
      total,
      refreshCart: fetchCart,
    }),
    [cart, addToCart, updateQty, removeFromCart, total, fetchCart],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export function useCart() {
  return useContext(CartContext);
}
