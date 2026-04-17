import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getProductById, getProducts } from "../api/productApi";
import { PageShell, PageHero, PageContent } from "../components/PageShell";
import MockupPreview from "../components/MockupPreview";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  const [selectedImage, setSelectedImage] = useState("");
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [openTab, setOpenTab] = useState("desc");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data?.colors?.length > 0) {
          setColor(data.colors[0]);
        }
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
    if (!Array.isArray(allProducts) || !product) return [];

    return allProducts
      .filter((p) => p._id !== id)
      .map((p) => {
        let score = 0;

        // Check for category matches
        const productCats = Array.isArray(product.category)
          ? product.category
          : [product.category];
        const pCats = Array.isArray(p.category) ? p.category : [p.category];

        productCats.forEach((cat) => {
          if (pCats.includes(cat)) score += 2;
        });

        // Check for subCategory matches
        const productSubCats = Array.isArray(product.subCategory)
          ? product.subCategory
          : [product.subCategory];
        const pSubCats = Array.isArray(p.subCategory)
          ? p.subCategory
          : [p.subCategory];

        productSubCats.forEach((sub) => {
          if (pSubCats.includes(sub)) score += 3;
        });

        return { ...p, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [allProducts, product, id]);

  const handleImage = useCallback((img) => {
    const url = img?.url || (typeof img === "string" ? img : "");
    setSelectedImage(url);
  }, []);
  const handleSize = useCallback((s) => setSize(s), []);
  const handleColor = useCallback((c) => setColor(c), []);
  const handleQty = useCallback((type) => {
    setQty((prev) => (type === "inc" ? prev + 1 : Math.max(1, prev - 1)));
  }, []);
  const handleTab = useCallback((key) => {
    setOpenTab((prev) => (prev === key ? null : key));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    try {
      await addToCart(product._id, qty, { size, color });
      toast.success("Added to cart");
    } catch {
      toast.error("Could not add to cart. Please sign in.");
    }
  }, [addToCart, product, qty, size, color]);

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
                    const url =
                      img?.url || (typeof img === "string" ? img : "");
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
                      {product.category?.[0] ||
                        product.category ||
                        "Limited Drop"}
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

              {/* COLOR SELECTOR */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Select Color
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColor(c)}
                        className={`group relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${
                          color === c
                            ? "ring-2 ring-black ring-offset-4 scale-110 shadow-lg"
                            : "ring-1 ring-zinc-200 hover:ring-zinc-400 hover:scale-105"
                        }`}
                        title={c}
                      >
                        <span
                          className="h-full w-full rounded-full border border-black/5"
                          style={{ backgroundColor: c }}
                        />
                        {color === c && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black uppercase px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {c}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SIZE SELECTOR */}
              {product.size && product.size.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {product.category?.[0]?.toLowerCase().includes("cup") ||
                      product.category?.[0]?.toLowerCase().includes("bottle")
                        ? "Select Volume"
                        : "Select Size"}
                    </span>
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-black transition-colors underline underline-offset-4">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.size.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSize(s)}
                        className={`flex min-w-[3.5rem] h-14 px-4 items-center justify-center rounded-2xl text-xs font-black uppercase transition-all duration-300 ${
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
              )}

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10"
                >
                  Add to Archive
                </button>
                <button
                  onClick={() =>
                    toast.success("Direct Acquisition coming soon")
                  }
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

          {/* MOCKUP PREVIEW SECTION */}
          <div className="mt-32">
            <MockupPreview />
          </div>

          {/* RELATED PRODUCTS */}
          {relatedProducts.length > 0 && (
            <div className="mt-32 space-y-16">
              <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em]">
                      The Collection
                    </span>
                    <div className="h-px w-12 bg-indigo-100" />
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none">
                    Similar <span className="text-zinc-200">Pieces</span>
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors underline underline-offset-8"
                >
                  View All Pieces
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
                {relatedProducts.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link to={`/product/${item._id}`} className="group block">
                      <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-50 border border-zinc-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500">
                        <img
                          src={
                            item.image?.url ||
                            (typeof item.image === "string" ? item.image : "")
                          }
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="mt-6 space-y-2 px-2">
                        <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-indigo-600 text-sm font-black tracking-tighter">
                          ₹{item.price}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(ProductDetail);
