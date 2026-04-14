import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { memo, useCallback } from "react";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const Cart = () => {
  const { cart, removeFromCart, updateQty, total } = useCart();

  const productId = (item) =>
    item.product?._id ?? item.product?.id ?? item.product;

  const handleRemove = useCallback(
    (id) => removeFromCart(id),
    [removeFromCart],
  );

  const handleQty = useCallback((id, type) => updateQty(id, type), [updateQty]);

  return (
    <PageShell>
      <PageHero
        align="left"
        title="Your"
        accent="Bag"
        subtitle={`${cart.length} piece${cart.length === 1 ? "" : "s"} selected`}
        headerRight={
          <Link
            to="/catalog"
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 transition-colors underline-offset-8 hover:text-black"
          >
            Continue exploring
          </Link>
        }
      />

      <PageContent>
        <div className="animate-fadeIn will-change-opacity">
          {cart.length === 0 ? (
            <div className="py-32 text-center bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100">
              <p className="text-2xl font-black uppercase tracking-tighter text-zinc-300 mb-6">
                Your bag is empty
              </p>
              <Link
                to="/catalog"
                className="inline-block bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-black/10"
              >
                Start Collecting
              </Link>
            </div>
          ) : (
            <div className="grid gap-20 lg:grid-cols-3">
              {/* CART ITEMS */}
              <div className="lg:col-span-2 space-y-8">
                {cart.map((item, idx) => {
                  const p = item.product;
                  const img =
                    p?.image?.url ||
                    p?.image ||
                    p?.images?.[0]?.url ||
                    p?.images?.[0] ||
                    "";
                  const name = p?.name ?? "";
                  const price = p?.price ?? 0;
                  const id = productId(item);
                  return (
                    <div
                      key={String(id)}
                      className="group flex flex-col sm:flex-row gap-8 pb-8 border-b border-zinc-100 animate-slideRight will-change-both"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="relative w-full sm:w-40 aspect-3/4 shrink-0 overflow-hidden rounded-4xl bg-zinc-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                        <img
                          src={img}
                          alt={name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors">
                              {name}
                            </h3>
                            <p className="text-xl font-black text-black tracking-tighter">
                              ₹{price}
                            </p>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            Premium Archive Piece
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-8">
                          {/* QTY */}
                          <div className="flex items-center gap-6 bg-zinc-50 px-5 py-3 rounded-xl border-2 border-zinc-100">
                            <button
                              className="text-lg font-black text-zinc-400 hover:text-black transition-colors"
                              onClick={() => handleQty(id, "dec")}
                            >
                              −
                            </button>
                            <span className="text-xs font-black w-4 text-center">
                              {item.qty}
                            </span>
                            <button
                              className="text-lg font-black text-zinc-400 hover:text-black transition-colors"
                              onClick={() => handleQty(id, "inc")}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(id)}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SUMMARY */}
              <div className="lg:col-span-1">
                <div className="bg-zinc-900 text-white rounded-[3rem] p-8 sm:p-10 lg:sticky lg:top-32 shadow-2xl shadow-black/20 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full" />

                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-10 relative">
                    Order <span className="text-zinc-500">Summary</span>
                  </h2>

                  <div className="space-y-6 relative">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-zinc-500">Archive Value</span>
                      <span>₹{total}</span>
                    </div>

                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-zinc-500">Logistics</span>
                      <span className="text-indigo-400">Complimentary</span>
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    <div className="flex justify-between items-end pt-4">
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                        Total Valuation
                      </span>
                      <span className="text-4xl font-black tracking-tighter">
                        ₹{total}
                      </span>
                    </div>

                    <Link to="/checkout" className="block pt-8">
                      <button className="w-full bg-white text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-xl">
                        Proceed to Checkout
                      </button>
                    </Link>

                    <p className="text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest">
                      Secure checkout powered by Razorpay
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(Cart);
