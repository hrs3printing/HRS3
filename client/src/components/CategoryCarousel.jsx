import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../api/productApi";

const CategoryCarousel = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const categoriesList = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories],
  );

  const openCategory = (cat) => {
    const slug = cat.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/catalog?select=${slug}`);
  };
  const closeModal = () => setActiveCategory(null);
  const goToCatalog = (category, subCategory) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (subCategory) params.set("subCategory", subCategory);
    navigate(`/catalog?${params.toString()}`);
    closeModal();
  };

  if (loading || categoriesList.length === 0) return null;

  return (
    <section className="relative w-full py-20 animate-fadeIn will-change-opacity">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16">
          <div className="animate-slideRight will-change-both">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none mb-5">
              Shop By <span className="text-gray-200">Category</span>
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-[0.25em]">
              Pick a category, then choose your style.
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:gap-6 lg:gap-8 grid-cols-5">
          {categoriesList.slice(0, 10).map((cat) => (
            <button
              key={cat._id || cat.name}
              onClick={() => openCategory(cat)}
              className="group text-left relative overflow-hidden rounded-xl sm:rounded-3xl border border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500 active:scale-[0.98]"
            >
              <div className="aspect-[4/5] bg-zinc-50">
                {cat.image?.url ? (
                  <img
                    src={cat.image.url}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-200 font-black uppercase text-xl sm:text-4xl bg-white">
                    {cat.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 sm:px-6 sm:pb-6 pt-8 sm:pt-12">
                <p className="text-[8px] sm:text-xl font-black uppercase tracking-tighter leading-none mb-0.5 sm:mb-1 text-white line-clamp-1">
                  {cat.name}
                </p>
                <p className="text-white/60 text-[6px] sm:text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block">
                  Explore
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/catalog"
            className="group inline-flex items-center gap-4 rounded-full bg-black px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
          >
            View Full Archive
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
          </Link>
        </div>
      </div>

      {activeCategory && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h3 className="text-xl font-black tracking-tight">
                {activeCategory.name}
              </h3>
              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-black text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Sub Categories
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {(activeCategory.subCategories || []).map((sub) => (
                  <button
                    key={sub._id || sub.name}
                    onClick={() => goToCatalog(activeCategory.name, sub.name)}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-left text-sm font-semibold text-zinc-700 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => goToCatalog(activeCategory.name)}
                className="mt-6 inline-flex rounded-full bg-black px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-600 transition-colors"
              >
                Browse {activeCategory.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryCarousel;
