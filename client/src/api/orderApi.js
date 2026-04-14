import api from "./axios";

export const placeOrder = async (orderData) => {
  try {
    const res = await api.post("/orders", orderData);
    return res.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        "Place order error:",
        error?.response?.data || error.message,
      );
    }
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const res = await api.post("/orders/verify", paymentData);
    return res.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(
        "Verify payment error:",
        error?.response?.data || error.message,
      );
    }
    throw error;
  }
};

export const getMyOrders = async () => {
  const res = await api.get("/orders/my");
  return res.data;
};
