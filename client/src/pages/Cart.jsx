import { useState, useEffect, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell, PageHero, PageContent } from "../components/PageShell";
import api from "../api/axios";
import toast from "react-hot-toast";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = useCallback(async () => {
    try {
      const { data } = await api.get("/cart");
      setCartItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      console.error("Cart load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQty = async (id, size, type) => {
    try {
      await api.put("/cart/update", { productId: id, type });
      loadCart();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const removeItem = async (id, size) => {
    try {
      await api.delete("/cart/remove", { data: { productId: id } });
      toast.success("Item removed from archive");
      loadCart();
    } catch (err) {
      toast.error("Removal failed");
    }
  };

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce(
        (acc, item) => acc + (item.product?.price || 0) * (item.qty || 0),
        0,
      )
    : 0;

  if (loading) {
    return (
      <PageShell>
        <PageHero
          title="Your"
          accent="Archive"
          subtitle="Loading contents..."
        />
        <PageContent>
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-100 border-t-black" />
          </div>
        </PageContent>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        title="Your"
        accent="Archive"
        subtitle={`${cartItems.length} curated pieces selected`}
      />

      <PageContent>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-fadeUp">
            <div className="w-24 h-24 rounded-full bg-zinc-50 flex items-center justify-center border-2 border-dashed border-zinc-200">
              <svg
                className="w-10 h-10 text-zinc-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase tracking-tighter text-black">
                Archive is Empty
              </h2>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                No pieces have been acquired yet.
              </p>
            </div>
            <Link
              to="/catalog"
              className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-20 lg:grid-cols-3">
            {/* LIST */}
            <div className="lg:col-span-2 space-y-8 animate-slideRight">
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  Selected Pieces
                </h2>
                <div className="h-px flex-1 bg-zinc-100" />
              </div>

              {cartItems.map((item, idx) => (
                <div
                  key={`${item.product?._id}-${item.size}`}
                  className="group flex gap-6 sm:gap-10 pb-8 border-b border-zinc-100 last:border-0"
                >
                  <Link
                    to={`/product/${item.product?._id}`}
                    className="relative aspect-[3/4] w-28 sm:w-40 shrink-0 overflow-hidden rounded-3xl bg-zinc-50 border border-zinc-100 shadow-sm transition-transform duration-500 group-hover:scale-95"
                  >
                    <img
                      src={item.product?.image?.url || item.product?.image}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-black group-hover:text-indigo-600 transition-colors leading-none">
                            {item.product?.name}
                          </h3>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                            {item.product?.subCategory?.[0] || "Premium Piece"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            removeItem(item.product?._id, item.size)
                          }
                          className="text-zinc-300 hover:text-red-500 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                            Size
                          </p>
                          <p className="text-xs font-black uppercase text-zinc-900">
                            {item.size}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-zinc-100" />
                        <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                            Price
                          </p>
                          <p className="text-xs font-black text-zinc-900">
                            ₹{item.product?.price}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-6 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                        <button
                          onClick={() =>
                            updateQty(item.product?._id, item.size, "dec")
                          }
                          className="text-lg font-black text-zinc-400 hover:text-black transition-colors"
                        >
                          −
                        </button>
                        <span className="text-xs font-black w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(item.product?._id, item.size, "inc")
                          }
                          className="text-lg font-black text-zinc-400 hover:text-black transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm sm:text-lg font-black text-black tracking-tighter">
                        ₹{(item.product?.price || 0) * (item.qty || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="lg:sticky lg:top-32 h-fit animate-slideLeft">
              <div className="bg-zinc-900 rounded-[3rem] p-8 sm:p-12 text-white space-y-10 shadow-2xl shadow-black/10">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    Summary
                  </h3>
                  <div className="h-px w-full bg-zinc-800" />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Subtotal
                    </span>
                    <span className="text-sm font-black uppercase tracking-tight">
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
                      Total
                    </span>
                    <span className="text-2xl font-black tracking-tighter text-indigo-500">
                      ₹{subtotal}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-xl"
                >
                  Proceed to Checkout
                </button>

                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest text-center leading-relaxed">
                  Taxes and shipping calculated at acquisition. <br />
                  Secure checkout via encrypted gateways.
                </p>
              </div>
            </div>
          </div>
        )}
      </PageContent>
    </PageShell>
  );
};

export default memo(Cart);
