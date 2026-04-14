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

  const openCategory = (category) => setActiveCategory(category);
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

        <div className="grid gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {categoriesList.map((cat) => (
            <button
              key={cat._id || cat.name}
              onClick={() => openCategory(cat)}
              className="group text-left relative overflow-hidden rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
            >
              <div className="aspect-square bg-zinc-100">
                {cat.image?.url ? (
                  <img
                    src={cat.image.url}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-300 font-black uppercase">
                    {cat.name}
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-3 pb-3 pt-10">
                <p className="text-white text-xs font-black uppercase tracking-wide">
                  {cat.name}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-600 transition-colors"
          >
            View All Products
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
                    key={sub}
                    onClick={() => goToCatalog(activeCategory.name, sub)}
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-left text-sm font-semibold text-zinc-700 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                  >
                    {sub}
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
