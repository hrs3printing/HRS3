import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import ProductSkeleton from "../components/ProductSkeleton";
import { getProducts, getCategories } from "../api/productApi";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const CatalogProducts = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const subCategoryParam = searchParams.get("sub");

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const categoryName = useMemo(() => {
    if (!slug) return null;
    return decodeURIComponent(slug).replace(/-/g, " ");
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setAllProducts(Array.isArray(prodData) ? prodData : []);
        setCategories(Array.isArray(catData) ? catData : []);

        // Track category visit
        if (categoryName) {
          const visits = JSON.parse(
            localStorage.getItem("categoryVisits") || "{}",
          );
          visits[categoryName.toLowerCase()] =
            (visits[categoryName.toLowerCase()] || 0) + 1;
          localStorage.setItem("categoryVisits", JSON.stringify(visits));
        }
      } catch (error) {
        console.error("Fetch data error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryName]);

  const currentCategory = useMemo(() => {
    if (!categoryName || !Array.isArray(categories)) return null;
    return categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase(),
    );
  }, [categoryName, categories]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];
    return allProducts.filter((p) => {
      // Check Category
      const prodCategory = Array.isArray(p.category)
        ? p.category
        : [p.category];
      const matchesCategory = prodCategory.some(
        (c) => c?.toLowerCase() === categoryName?.toLowerCase(),
      );

      if (!matchesCategory) return false;

      // Check Sub-Category if param exists
      if (subCategoryParam) {
        const prodSubCategory = Array.isArray(p.subCategory)
          ? p.subCategory
          : [p.subCategory];
        return prodSubCategory.some(
          (s) => s?.toLowerCase() === subCategoryParam.toLowerCase(),
        );
      }

      return true;
    });
  }, [allProducts, categoryName, subCategoryParam]);

  const formatCategoryName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <PageShell>
        <PageHero
          align="left"
          title="The"
          accent="Archive"
          subtitle="Loading..."
        />
        <PageContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
          </div>
        </PageContent>
      </PageShell>
    );
  }

  if (!currentCategory) {
    return (
      <PageShell>
        <section className="w-full py-20 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-4">
            Category Not Found
          </h1>
          <p className="text-zinc-400 mb-8">
            The category "{categoryName}" does not exist.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-600 transition-colors"
          >
            Back to Categories
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        align="left"
        title={formatCategoryName(categoryName)}
        accent={
          subCategoryParam ? `/ ${formatCategoryName(subCategoryParam)}` : ""
        }
        subtitle={`${filteredProducts.length} premium pieces`}
      >
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/catalog")}
            className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <svg
              className="h-3 w-3 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Archive
          </button>
        </div>
      </PageHero>

      <PageContent className="!pt-0 sm:!pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, idx) => (
              <div
                key={product._id}
                className="animate-scaleIn will-change-both"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <Link to={`/product/${product._id}`} className="group block">
                  <div className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-50 border border-zinc-100 transition-all duration-500">
                    <img
                      src={product.image?.url || product.image || ""}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* MINIMAL OVERLAY */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500" />

                    {/* SUBTLE BADGE */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <span className="bg-white/80 backdrop-blur-md text-zinc-500 text-[7px] sm:text-[8px] font-black uppercase px-2 py-1 rounded-md border border-zinc-100">
                        {product.subCategory?.[0] ||
                          product.subCategory ||
                          "Premium"}
                      </span>
                    </div>

                    {/* MINIMAL CTA */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <button className="w-full bg-white text-black py-2.5 sm:py-3 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-xl shadow-xl border border-zinc-100 active:scale-95">
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5 space-y-1.5 px-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[11px] sm:text-[13px] font-bold uppercase tracking-tight text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-zinc-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                        {product.subCategory?.[0] || "Fresh Drop"}
                      </p>
                      <p className="text-zinc-900 text-[11px] sm:text-[13px] font-black tracking-tighter">
                        ₹{product.price}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-zinc-400 text-lg font-bold uppercase tracking-widest">
                No products found in this category
              </p>
            </div>
          )}
        </div>
      </PageContent>
    </PageShell>
  );
};

export default CatalogProducts;
