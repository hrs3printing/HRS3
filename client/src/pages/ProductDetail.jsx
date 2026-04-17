import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { getProductById, getProducts } from "../api/productApi";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  const [selectedImage, setSelectedImage] = useState("");
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [openTab, setOpenTab] = useState("desc");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        const mainImg =
          data?.images?.[0]?.url ||
          data?.images?.[0] ||
          data?.image?.url ||
          data?.image ||
          "";
        setSelectedImage(mainImg);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAll();
  }, []);

  const relatedProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];
    return allProducts.filter((p) => p._id !== id).slice(0, 4);
  }, [allProducts, id]);

  const handleImage = useCallback((img) => {
    const url = img?.url || (typeof img === "string" ? img : "");
    setSelectedImage(url);
  }, []);
  const handleSize = useCallback((s) => setSize(s), []);
  const handleQty = useCallback((type) => {
    setQty((prev) => (type === "inc" ? prev + 1 : Math.max(1, prev - 1)));
  }, []);
  const handleTab = useCallback((key) => {
    setOpenTab((prev) => (prev === key ? null : key));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    try {
      await addToCart(product._id, qty);
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart. Please sign in.");
    }
  }, [addToCart, product, qty]);

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-zinc-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <PageShell>
      <PageContent>
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20">
            {/* LEFT: IMAGES */}
            <div className="space-y-6 animate-fadeIn">
              <div className="aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-zinc-50 border border-zinc-100 shadow-sm group">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {product.images?.length > 1 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {product.images.map((img, i) => {
                    const url = img?.url || (typeof img === "string" ? img : "");
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(url)}
                        className={`relative aspect-square w-20 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                          selectedImage === url
                            ? "border-black scale-95 shadow-lg"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: DETAILS */}
            <div className="flex flex-col gap-10 sm:gap-14 py-4 animate-slideLeft">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em]">
                      {product.category?.[0] || product.category || "Limited Drop"}
                    </span>
                    <div className="h-px w-8 bg-indigo-100" />
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none">
                    {product.name}
                  </h1>
                </div>
                <p className="text-3xl font-black tracking-tighter text-black">
                  ₹{product.price}
                </p>
              </div>

              {/* SIZE SELECTOR */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Select Size
                  </span>
                  <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-black transition-colors underline underline-offset-4">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {["S", "M", "L", "XL", "XXL"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSize(s)}
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xs font-black uppercase transition-all duration-300 ${
                        size === s
                          ? "bg-black text-white shadow-xl shadow-black/20 scale-105"
                          : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10"
                >
                  Add to Archive
                </button>
                <button
                  onClick={() => toast.success("Direct Acquisition coming soon")}
                  className="flex-1 bg-zinc-100 text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all active:scale-95 border border-zinc-200"
                >
                  Direct Acquisition
                </button>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-6 pt-10 border-t border-zinc-100">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                    Design Brief
                  </h3>
                  <div className="h-px flex-1 bg-zinc-50" />
                </div>
                <p className="text-sm font-medium leading-relaxed text-zinc-500 uppercase tracking-tight">
                  {product.description}
                </p>
              </div>

              {/* FEATURES */}
              <div className="grid grid-cols-2 gap-8 pt-6">
                {[
                  { label: "Material", val: "100% Premium Cotton" },
                  { label: "GSM", val: "240 Heavyweight" },
                  { label: "Fit", val: "Signature Oversized" },
                  { label: "Origin", val: "Archive Studio" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      {item.label}
                    </p>
                    <p className="text-xs font-black uppercase text-zinc-900 tracking-tight">
                      {item.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(ProductDetail);
