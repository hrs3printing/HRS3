import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getNewArrivals } from "../api/productApi";
import { useCart } from "../context/CartContext";
import ProductSkeleton from "./ProductSkeleton";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const productList = Array.isArray(products) ? products : [];

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const data = await getNewArrivals();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart. Please sign in.");
    }
  };

  return (
    <section className="relative w-full overflow-hidden py-20 animate-fadeIn will-change-opacity">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-zinc-50/50 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-20 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-slideRight will-change-both">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none">
              New <span className="text-gray-200">Arrivals</span>
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <span className="h-px w-8 bg-indigo-600" />
              <p className="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-[0.3em]">
                Fresh drops. premium quality.
              </p>
            </div>
          </div>

          <div className="animate-slideLeft will-change-both">
            <Link
              to="/catalog"
              className="group relative inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-full transition-all hover:pr-8 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 text-xs font-black uppercase tracking-widest">
                Explore All
              </span>
              <svg
                className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => <ProductSkeleton key={i} />)
            : productList.map((product, idx) => (
                <div
                  key={product._id}
                  className="animate-scaleIn will-change-both"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <Link
                    to={`/product/${product._id}`}
                    className="group relative cursor-pointer block"
                  >
                    <div className="relative overflow-hidden rounded-4xl bg-zinc-100 aspect-3/4 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500">
                      <img
                        src={
                          product.image?.url ||
                          (typeof product.image === "string"
                            ? product.image
                            : "")
                        }
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Glassmorphism Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="bg-white/90 backdrop-blur-md text-black text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 shadow-xl">
                          New
                        </span>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[0.16, 1, 0.3, 1]">
                        <button
                          className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:text-white transition-colors shadow-2xl active:scale-95"
                          onClick={(e) => handleAddToCart(e, product._id)}
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 px-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-indigo-600 text-sm font-black tracking-tighter">
                          ₹{product.price}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                          {product.category || "Premium Essential"}
                        </p>
                        <div className="flex gap-1">
                          <div className="h-1 w-4 rounded-full bg-zinc-100 group-hover:bg-indigo-100 transition-colors" />
                          <div className="h-1 w-1 rounded-full bg-zinc-100 group-hover:bg-indigo-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default memo(NewArrivals);
