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
      <PageHero size="compact">
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          <Link to="/" className="transition-colors hover:text-black">
            Home
          </Link>
          <span className="h-1 w-1 rounded-full bg-zinc-200" />
          <Link to="/catalog" className="transition-colors hover:text-black">
            Archive
          </Link>
          <span className="h-1 w-1 rounded-full bg-zinc-200" />
          <span className="text-indigo-600">{product.name}</span>
        </div>
      </PageHero>

      <PageContent>
        <div className="animate-fadeIn will-change-opacity">
          {/* MAIN */}
          <div className="grid gap-20 lg:grid-cols-2">
            {/* IMAGES */}
            <div className="space-y-6">
              <div className="aspect-3/4 overflow-hidden rounded-[3rem] bg-zinc-50 shadow-2xl shadow-black/5">
                <img
                  key={selectedImage}
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover animate-scaleIn will-change-transform"
                />
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {product.images?.map((img, i) => {
                  const url = img?.url || (typeof img === "string" ? img : "");
                  return (
                    <button
                      key={i}
                      onClick={() => handleImage(img)}
                      className={`relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 active:scale-95 ${
                        selectedImage === url
                          ? "border-indigo-600 shadow-lg shadow-indigo-500/20"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex flex-col justify-center">
              <div className="animate-slideLeft will-change-both">
                <div className="space-y-2 mb-8">
                  <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] block">
                    {product.category?.[0] ||
                      product.category ||
                      "Premium Essential"}
                  </span>
                  <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none">
                    {product.name}
                  </h1>
                </div>

                <div className="flex items-center gap-6 mb-12">
                  <p className="text-3xl font-black text-black tracking-tighter">
                    ₹{product.price}
                  </p>
                  <div className="h-8 w-px bg-zinc-100" />
                  <div className="flex items-center gap-2">
                    <div className="flex text-indigo-600">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      4.9/5 Rating
                    </span>
                  </div>
                </div>

                {/* SIZE */}
                <div className="mb-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                      Select Dimension
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 underline">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {["S", "M", "L", "XL"].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSize(s)}
                        className={`h-14 w-14 text-xs font-black rounded-2xl transition-all border-2 flex items-center justify-center ${
                          size === s
                            ? "bg-black text-white border-black shadow-xl"
                            : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QTY & ACTIONS */}
                <div className="flex gap-4 mb-12">
                  <div className="flex items-center gap-6 bg-zinc-50 px-6 py-4 rounded-2xl border-2 border-zinc-100">
                    <button
                      onClick={() => handleQty("dec")}
                      className="text-xl font-black text-zinc-400 hover:text-black transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-black w-4 text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQty("inc")}
                      className="text-xl font-black text-zinc-400 hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10"
                  >
                    Acquire Piece
                  </button>
                </div>

                {/* TABS */}
                <div className="space-y-4 border-t border-zinc-100 pt-10">
                  {[
                    {
                      key: "desc",
                      title: "Archive Notes",
                      content: product.description,
                    },
                    {
                      key: "care",
                      title: "Preservation",
                      content:
                        "Wash inside out with similar colors. Air dry recommended to maintain print longevity.",
                    },
                    {
                      key: "shipping",
                      title: "Logistics",
                      content:
                        "Standard delivery within 5-7 business days across India. Free shipping on all prepaid orders.",
                    },
                  ].map((tab) => (
                    <div
                      key={tab.key}
                      className={`rounded-2xl border-2 transition-all duration-300 ${openTab === tab.key ? "border-zinc-900 bg-white" : "border-transparent"}`}
                    >
                      <button
                        className="w-full flex items-center justify-between p-4 text-left"
                        onClick={() => handleTab(tab.key)}
                      >
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">
                          {tab.title}
                        </h3>
                        <span
                          className={`transition-transform duration-300 ${openTab === tab.key ? "rotate-45" : ""}`}
                        >
                          +
                        </span>
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openTab === tab.key
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <p className="px-4 pb-4 text-zinc-500 text-xs font-medium leading-relaxed">
                          {tab.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RELATED */}
          <div className="mt-20">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">
                Similar <span className="text-zinc-200">Pieces</span>
              </h2>
              <div className="h-px flex-1 bg-zinc-100" />
            </div>

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-10">
              {relatedProducts.map((item, idx) => (
                <div
                  key={item._id}
                  className="group animate-scaleIn will-change-both"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <Link to={`/product/${item._id}`}>
                    <div className="aspect-3/4 overflow-hidden rounded-[2.5rem] bg-zinc-100 mb-6 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500">
                      <img
                        src={item.image?.url || item.image || ""}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt=""
                      />
                    </div>
                    <div className="px-2 space-y-1">
                      <h3 className="text-xs font-black uppercase tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-indigo-600 text-xs font-black">
                        ₹{item.price}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(ProductDetail);
