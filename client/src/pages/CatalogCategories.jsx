import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCategories } from "../api/productApi";
import ProductSkeleton from "../components/ProductSkeleton";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const CatalogCategories = () => {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);

  const selectedSlug = useMemo(() => {
    return new URLSearchParams(location.search).get("select");
  }, [location.search]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats);

        if (cats.length > 0) {
          const selected = selectedSlug
            ? cats.find(
                (c) =>
                  c.name.toLowerCase().replace(/\s+/g, "-") === selectedSlug,
              )
            : cats[0];

          setActiveCategory(selected || cats[0]);
          setActiveSubCategory(null); // Reset sub-category when main category changes
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, [selectedSlug]);

  const displayedSubCategories = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory.name.toLowerCase() === "tshirt" && !activeSubCategory) {
      // For Tshirt, if no neck type is selected, show neck types (Round Neck, V Neck)
      return activeCategory.subCategories || [];
    }
    if (activeSubCategory) {
      return activeSubCategory.subCategories || [];
    }
    return activeCategory.subCategories || [];
  }, [activeCategory, activeSubCategory]);

  if (loading) {
    return (
      <PageShell>
        <PageHero
          align="left"
          title="The"
          accent="Collections"
          subtitle="Loading categories..."
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

  return (
    <PageShell>
      <PageHero
        align="left"
        title="Explore"
        accent="Collections"
        subtitle={`${categories.length} Curated Categories`}
      />

      <PageContent className="!pt-0 sm:!pt-0 !px-0 sm:!px-8 max-w-[1600px] mx-auto">
        <div className="flex gap-0 sm:gap-16 min-h-[75vh]">
          {/* LEFT: MAIN CATEGORIES (SMALL & MINIMAL) */}
          <aside className="w-[90px] sm:w-28 border-r border-zinc-100/80 bg-zinc-50/30">
            <div className="sticky top-24 sm:top-32 py-8 sm:py-4 flex flex-col items-center gap-8 sm:gap-10 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
              {categories.map((cat, idx) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat)}
                  className={`group flex flex-col items-center gap-3 transition-all duration-500 flex-shrink-0 animate-fadeUp`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-700 ${
                      activeCategory?._id === cat._id
                        ? "bg-zinc-900 ring-4 ring-zinc-900/5 scale-110 shadow-xl shadow-zinc-900/10"
                        : "bg-transparent group-hover:bg-zinc-200"
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-white border border-zinc-100">
                      {cat.image?.url ? (
                        <img
                          src={cat.image.url}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-200 font-black text-xl uppercase">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-center leading-tight transition-all duration-500 max-w-[70px] ${
                      activeCategory?._id === cat._id
                        ? "text-zinc-900 scale-105"
                        : "text-zinc-400 opacity-60 group-hover:opacity-100"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT: SUB-CATEGORIES CONTENT */}
          <main className="flex-1 p-6 sm:p-0">
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-10 sm:mb-16">
                <div className="space-y-1">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">
                    {activeSubCategory
                      ? activeSubCategory.name
                      : activeCategory?.name}
                  </h2>
                  <p className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-zinc-900">
                    {activeSubCategory ? "Collection" : "Archives"}
                  </p>
                </div>
                {activeSubCategory && (
                  <button
                    onClick={() => setActiveSubCategory(null)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors"
                  >
                    <svg
                      className="w-3 h-3"
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
                    Back to Neck Types
                  </button>
                )}
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-100 to-transparent ml-8 sm:ml-12" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                {/* SUB-CATEGORIES */}
                {displayedSubCategories.map((sub, idx) => {
                  const isNeckType =
                    activeCategory?.name.toLowerCase() === "tshirt" &&
                    !activeSubCategory;

                  return (
                    <button
                      key={sub._id || sub.name}
                      onClick={() => {
                        if (isNeckType) {
                          setActiveSubCategory(sub);
                        } else {
                          // Standard navigation
                          const slug = activeCategory.name
                            .toLowerCase()
                            .replace(/\s+/g, "-");
                          const subParam = encodeURIComponent(sub.name);
                          window.location.href = `/catalog/${slug}?sub=${subParam}`;
                        }
                      }}
                      className="group block relative animate-fadeUp text-left"
                      style={{ animationDelay: `${idx * 70}ms` }}
                    >
                      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-zinc-100 transition-all duration-700 hover:border-zinc-200 hover:shadow-2xl hover:shadow-zinc-500/5">
                        {sub.image?.url ? (
                          <img
                            src={sub.image.url}
                            alt={sub.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-100 font-black text-4xl sm:text-6xl uppercase bg-zinc-50/50">
                            {sub.name.charAt(0)}
                          </div>
                        )}

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
                          <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                            <p className="text-indigo-600 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] mb-1 sm:mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                              {isNeckType ? "NECK TYPE" : "COLLECTION"}
                            </p>
                            <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter text-zinc-900 group-hover:text-zinc-900 transition-colors leading-tight">
                              {sub.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </PageContent>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </PageShell>
  );
};

export default CatalogCategories;
