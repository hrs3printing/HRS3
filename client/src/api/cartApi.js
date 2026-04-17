import api from "./axios";

// 🛒 GET CART
export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

// ➕ ADD ITEM
export const addItem = async (productId, qty = 1, options = {}) => {
  const res = await api.post("/cart/add", {
    productId,
    qty,
    ...options,
  });
  return res.data;
};

// 🔄 UPDATE QTY
export const updateItem = async (productId, type) => {
  const res = await api.put("/cart/update", {
    productId,
    type,
  });
  return res.data;
};

// ❌ REMOVE ITEM
export const removeItem = async (productId) => {
  const res = await api.delete("/cart/remove", {
    data: { productId },
  });
  return res.data;
};
