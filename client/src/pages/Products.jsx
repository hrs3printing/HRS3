import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductSkeleton from "../components/ProductSkeleton";
import { getProducts, getCategories } from "../api/productApi";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const selectedSubCategory = searchParams.get("subCategory");
  const searchQuery = searchParams.get("search");

  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState(3000);
  const [size, setSize] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const categoryData = useMemo(() => {
    const data = {};
    if (!Array.isArray(categories)) return data;
    categories.forEach((cat) => {
      if (cat?.name) {
        data[cat.name] = Array.isArray(cat.subCategories) ? cat.subCategories : [];
      }
    });
    return data;
  }, [categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setAllProducts(Array.isArray(prodData) ? prodData : []);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (error) {
        console.error("Fetch data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];
    let result = [...allProducts];

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory)
      result = result.filter((p) =>
        Array.isArray(p.category)
          ? p.category.includes(selectedCategory)
          : p.category === selectedCategory,
      );

    if (selectedSubCategory)
      result = result.filter((p) =>
        Array.isArray(p.subCategory)
          ? p.subCategory.includes(selectedSubCategory)
          : p.subCategory === selectedSubCategory,
      );

    if (size)
      result = result.filter(
        (p) => Array.isArray(p.size) && p.size.includes(size),
      );

    if (price) result = result.filter((p) => p.price <= price);

    if (sort === "low") result.sort((a, b) => a.price - b.price);
    else if (sort === "high") result.sort((a, b) => b.price - a.price);

    return result;
  }, [
    allProducts,
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    size,
    price,
    sort,
  ]);

  const setCategory = useCallback(
    (category) => {
      const params = new URLSearchParams(searchParams);
      if (category === "All") {
        params.delete("category");
        params.delete("subCategory");
      } else {
        params.set("category", category);
        params.delete("subCategory");
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const setSubCategory = useCallback(
    (sub) => {
      const params = new URLSearchParams(searchParams);
      if (params.get("subCategory") === sub) {
        params.delete("subCategory");
      } else {
        params.set("subCategory", sub);
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
    setPrice(3000);
    setSize("");
    setSort("");
  }, [setSearchParams]);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  return (
    <PageShell>
      <PageHero
        align="left"
        title="The"
        accent="Archive"
        subtitle={`${filteredProducts.length} premium pieces`}
      >
        {searchQuery ? (
          <div className="rounded-full bg-indigo-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20">
            Search: {searchQuery}
          </div>
        ) : null}
      </PageHero>

      <PageContent>
        <div className="flex flex-col gap-20 md:flex-row">
          {/* MOBILE FILTER TRIGGER */}
          <div className="md:hidden flex justify-between items-center mb-8">
            <button
              onClick={toggleFilters}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest"
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Filters
            </button>
            <div className="h-px flex-1 bg-zinc-100 mx-6" />
          </div>

          {/* SIDEBAR */}
          <div
            className={`fixed inset-0 z-100 bg-white transition-all duration-500 ease-[0.16,1,0.3,1] md:relative md:z-0 md:bg-transparent md:block md:w-64 shrink-0 ${
              showFilters
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0 md:translate-x-0 md:opacity-100"
            } ${showFilters ? "block" : "hidden md:block"}`}
          >
            <div className="h-full space-y-20 overflow-y-auto p-8 md:p-0">
              <div className="flex justify-between items-center md:hidden mb-12">
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  Filters
                </h2>
                <button
                  onClick={toggleFilters}
                  className="p-2 bg-zinc-100 rounded-full"
                >
                  <svg
                    className="w-6 h-6"
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

              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                  Archive Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-black transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* CATEGORIES */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                  Collections
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setCategory("All")}
                    className={`text-left text-xs font-bold uppercase tracking-widest transition-all py-2 border-b-2 ${
                      !selectedCategory
                        ? "text-indigo-600 border-indigo-600"
                        : "text-zinc-400 border-transparent hover:text-zinc-900"
                    }`}
                  >
                    All Pieces
                  </button>
                  {Object.keys(categoryData).map((cat) => (
                    <div key={cat} className="space-y-2">
                      <button
                        onClick={() => setCategory(cat)}
                        className={`w-full text-left text-xs font-bold uppercase tracking-widest transition-all py-2 border-b-2 flex justify-between items-center ${
                          selectedCategory === cat
                            ? "text-indigo-600 border-indigo-600"
                            : "text-zinc-400 border-transparent hover:text-zinc-900"
                        }`}
                      >
                        {cat}
                        {categoryData[cat].length > 0 && (
                          <span className="text-[10px]">
                            {selectedCategory === cat ? "−" : "+"}
                          </span>
                        )}
                      </button>
                      <div
                        className={`pl-4 space-y-2 overflow-hidden transition-all duration-300 ${
                          selectedCategory === cat &&
                          categoryData[cat].length > 0
                            ? "max-h-96 opacity-100 mt-2"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {categoryData[cat].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setSubCategory(sub)}
                            className={`block w-full text-left text-[10px] font-black uppercase tracking-widest transition-colors ${
                              selectedSubCategory === sub
                                ? "text-indigo-600"
                                : "text-zinc-400 hover:text-zinc-900"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIZES */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                  Dimensions
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(size === s ? "" : s)}
                      className={`h-10 text-[10px] font-black rounded-xl transition-all border-2 ${
                        size === s
                          ? "bg-black text-white border-black shadow-lg"
                          : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRICE */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                    Value
                  </p>
                  <span className="text-[10px] font-black text-indigo-600">
                    ₹{price}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* SORT */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
                  Order
                </p>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
                >
                  <option value="">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => <ProductSkeleton key={i} />)
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => (
                  <div
                    key={product._id}
                    className="animate-scaleIn will-change-both"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <Link
                      to={`/product/${product._id}`}
                      className="group block"
                    >
                      <div className="relative aspect-3/4 rounded-4xl overflow-hidden bg-zinc-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500">
                        <img
                          src={product.image?.url || product.image || ""}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-md text-black text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-white/20 shadow-xl">
                            {product.category?.[0] ||
                              product.category ||
                              "Premium"}
                          </span>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[0.16, 1, 0.3, 1]">
                          <button className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:text-white transition-colors shadow-2xl active:scale-95">
                            View Piece
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2 px-2">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-indigo-600 text-sm font-black tracking-tighter">
                            ₹{product.price}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                            {product.subCategory?.[0] || "Fresh Drop"}
                          </p>
                          <div className="flex gap-1">
                            <div className="h-1 w-4 rounded-full bg-zinc-100 group-hover:bg-indigo-100 transition-colors" />
                            <div className="h-1 w-1 rounded-full bg-zinc-100 group-hover:bg-indigo-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center">
                  <p className="text-2xl font-black uppercase tracking-tighter text-zinc-300 mb-4">
                    No Pieces Found
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-black transition-colors underline"
                  >
                    Clear Archive Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContent>

      {/* OVERLAY */}
      {showFilters && (
        <div
          onClick={toggleFilters}
          className="fixed inset-0 bg-transparent z-40 md:hidden"
        />
      )}
    </PageShell>
  );
};

export default memo(Products);
