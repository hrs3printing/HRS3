import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell, PageHero, PageContent } from "../components/PageShell";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cart: cartItems, total: subtotal } = useCart();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartItems.length) {
      toast.error("Archive is empty");
      return;
    }
    try {
      const { data: order } = await api.post("/orders", {
        items: cartItems,
        shippingAddress: form,
        totalAmount: subtotal,
      });

      // Handle Razorpay (assuming it's implemented in your backend)
      if (order.razorpayOrderId) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: subtotal * 100,
          currency: "INR",
          name: "HRS3 ARCHIVE",
          description: "Archive Acquisition",
          order_id: order.razorpayOrderId,
          handler: async (response) => {
            try {
              await api.post("/orders/verify", {
                orderId: order._id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success("Acquisition Successful");
              navigate("/orders");
            } catch (err) {
              toast.error("Verification failed");
            }
          },
          theme: { color: "#000000" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    }
  };

  return (
    <PageShell>
      <PageHero
        title="Finalize"
        accent="Acquisition"
        subtitle="Secure encrypted checkout for your curated archive"
      />

      <PageContent>
        <div className="grid gap-20 lg:grid-cols-2">
          {/* LEFT: FORM */}
          <div className="space-y-12 animate-slideRight">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  Logistics Identity
                </h2>
                <div className="h-px flex-1 bg-zinc-100" />
              </div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-tight">
                Where should we dispatch your archive pieces?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="GIVEN NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="SURNAME"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Digital Reach
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="EMAIL"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Direct Line
                  </label>
                  <input
                    name="phone"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="PHONE"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                  Primary Location
                </label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-3xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                  placeholder="STREET, APARTMENT, LANDMARK"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    City
                  </label>
                  <input
                    name="city"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="CITY"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    State
                  </label>
                  <input
                    name="state"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="STATE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Zip Code
                  </label>
                  <input
                    name="pincode"
                    required
                    onChange={handleChange}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    placeholder="PINCODE"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="animate-slideLeft">
            <div className="bg-zinc-900 rounded-[3rem] p-8 sm:p-12 text-white space-y-12 shadow-2xl shadow-black/10">
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  Acquisition Summary
                </h3>
                <div className="h-px w-full bg-zinc-800" />
              </div>

              <div className="space-y-6 max-h-[30vh] overflow-y-auto no-scrollbar pr-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product?._id}-${item.size}`}
                    className="flex justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        <img
                          src={item.product?.image?.url || item.product?.image}
                          className="h-full w-full object-cover opacity-80"
                          alt=""
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black uppercase tracking-tight text-white leading-none">
                          {item.product?.name}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                          {item.size || "M"} × {item.qty}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-zinc-400">
                      ₹{(item.product?.price || 0) * (item.qty || 0)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Archive Value
                  </span>
                  <span className="text-sm font-black tracking-tight">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Logistics
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    Complimentary
                  </span>
                </div>
                <div className="h-px w-full border-t border-dashed border-zinc-800" />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                    Total Acquisition
                  </span>
                  <span className="text-3xl font-black tracking-tighter text-indigo-500">
                    ₹{subtotal}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-xl"
              >
                Complete Payment
              </button>

              <div className="flex items-center justify-center gap-6 opacity-40 grayscale contrast-125 pt-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                  className="h-4"
                  alt="PayPal"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  className="h-6"
                  alt="Mastercard"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                  className="h-3"
                  alt="Visa"
                />
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(Checkout);
