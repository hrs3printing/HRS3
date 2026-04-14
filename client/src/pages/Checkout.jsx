import { useCart } from "../context/CartContext";
import { useState, useCallback, memo } from "react";
import toast from "react-hot-toast";
import { placeOrder, verifyPayment } from "../api/orderApi";
import { useNavigate } from "react-router-dom";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const Checkout = () => {
  const { cart, total, refreshCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [payment, setPayment] = useState("cod");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePayment = useCallback((method) => {
    setPayment(method);
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrderHandler = useCallback(async () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.phone?.trim()) {
      toast.error("Please fill in name, email, and phone.");
      return;
    }

    try {
      const order = await placeOrder({
        shippingAddress: form,
        paymentMethod: payment,
      });

      if (payment === "cod") {
        await refreshCart();
        toast.success("Order placed successfully");
        navigate("/");
      } else {
        const res = await loadRazorpayScript();

        if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          return;
        }

        const razorpayKey =
          order.razorpay_key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          toast.error("Payment is temporarily unavailable. Missing Razorpay key.");
          return;
        }

        if (!order.razorpay_order_id) {
          toast.error("Payment initialization failed. Please try again.");
          return;
        }

        const options = {
          key: razorpayKey,
          amount: order.total * 100,
          currency: "INR",
          name: "HRS3 Store",
          description: "Payment for your order",
          order_id: order.razorpay_order_id,
          handler: async (response) => {
            const toastId = toast.loading("Verifying payment...");
            try {
              const verifyRes = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order._id,
              });

              if (verifyRes.success) {
                await refreshCart();
                toast.success("Payment successful!", { id: toastId });
                navigate("/");
              }
            } catch (err) {
              console.error("Verification Error:", err);
              toast.error(
                "Payment verification failed. Please contact support if amount was deducted.",
                { id: toastId },
              );
            }
          },
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          notes: {
            address: form.address,
          },
          theme: {
            color: "#000000",
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Order failed. Try again.";
      toast.error(msg);
    }
  }, [form, payment, navigate, refreshCart]);

  return (
    <PageShell>
      <PageHero
        align="left"
        title="Secure"
        accent="Checkout"
        subtitle="Finalizing your archive collection"
      />

      <PageContent>
        <div className="grid gap-20 lg:grid-cols-3">
          {/* LEFT: FORM */}
          <div className="space-y-20 lg:col-span-2 animate-slideRight will-change-both">
            {/* SHIPPING */}
            <section className="space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                Logistics Details
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Identity
                  </label>
                  <input
                    name="name"
                    placeholder="FULL NAME"
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Digital Reach
                  </label>
                  <input
                    name="email"
                    placeholder="EMAIL ADDRESS"
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Contact Line
                  </label>
                  <input
                    name="phone"
                    placeholder="PHONE NUMBER"
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Urban Area
                  </label>
                  <input
                    name="city"
                    placeholder="CITY"
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Destination
                  </label>
                  <textarea
                    name="address"
                    placeholder="FULL POSTAL ADDRESS"
                    rows="3"
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-4xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Region Code
                  </label>
                  <input
                    name="pincode"
                    placeholder="PINCODE"
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                Transaction Method
              </h2>
              <div className="grid gap-4">
                {[
                  {
                    id: "cod",
                    label: "Cash on Delivery",
                    desc: "Pay when your archive pieces arrive",
                  },
                  {
                    id: "razorpay",
                    label: "Online Payment",
                    desc: "Secure digital transaction via Razorpay",
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`group relative flex items-center justify-between p-6 rounded-4xl border-2 cursor-pointer transition-all duration-300 ${
                      payment === m.id
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-2xl"
                        : "border-zinc-100 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          payment === m.id
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-zinc-200"
                        }`}
                      >
                        {payment === m.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest">
                          {m.label}
                        </p>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-widest ${payment === m.id ? "text-zinc-500" : "text-zinc-400"}`}
                        >
                          {m.desc}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      checked={payment === m.id}
                      onChange={() => handlePayment(m.id)}
                    />
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-50 rounded-[3rem] p-8 sm:p-10 lg:sticky lg:top-32 border-2 border-zinc-100">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-10">
                Final <span className="text-zinc-300">Invoice</span>
              </h2>

              <div className="space-y-6">
                {/* ITEM PREVIEW */}
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"
                    >
                      <span className="text-zinc-500 truncate mr-4">
                        {item.product.name} × {item.qty}
                      </span>
                      <span className="shrink-0">
                        ₹{item.product.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px w-full bg-zinc-200" />

                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="text-zinc-400">Subtotal</span>
                  <span>₹{total}</span>
                </div>

                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="text-zinc-400">Logistics</span>
                  <span className="text-indigo-600">Free</span>
                </div>

                <div className="h-px w-full bg-zinc-200" />

                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Total Value
                  </span>
                  <span className="text-4xl font-black tracking-tighter text-black">
                    ₹{total}
                  </span>
                </div>

                <button
                  onClick={placeOrderHandler}
                  className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10 mt-10"
                >
                  Confirm Acquisition
                </button>

                <div className="flex items-center justify-center gap-3 mt-6">
                  <svg
                    className="w-4 h-4 text-zinc-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Encrypted Checkout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(Checkout);
