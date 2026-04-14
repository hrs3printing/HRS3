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

  const addToCart = useCallback(async (productId, qty = 1) => {
    try {
      const data = await addItem(productId, qty);
      setCart([...(data.items || [])]);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Add to cart error:", error);
      throw error;
    }
  }, []);

  const updateQty = useCallback(async (productId, type) => {
    try {
      const data = await updateItem(productId, type);
      setCart([...(data.items || [])]);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Update cart error:", error);
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    try {
      const data = await removeItem(productId);
      setCart([...(data.items || [])]);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Remove item error:", error);
    }
  }, []);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.qty,
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
