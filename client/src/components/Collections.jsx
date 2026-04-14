import { Link } from "react-router-dom";
import menCategory from "../assets/men-category.jpg";

const Collections = () => {
  return (
    <section className="w-full py-20 animate-fadeIn will-change-opacity">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16">
          <div className="animate-slideRight will-change-both">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none mb-6">
              Shop By <span className="text-gray-200">Category</span>
            </h2>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-indigo-600" />
              <p className="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-[0.3em]">
                Find your perfect style.
              </p>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3 md:grid-rows-2 md:h-[600px]">
          {/* LEFT (SPANS 2 ROWS) */}
          <div className="md:col-span-2 md:row-span-2 group relative cursor-pointer h-[400px] md:h-full animate-fadeUp will-change-both">
            <div className="relative h-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/10 border border-black/5">
              <img
                src={menCategory}
                alt="Men's collection"
                className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 text-white">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-indigo-400">
                  Essential Wear
                </span>
                <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-6">
                  Men
                </h3>

                <Link
                  to="/catalog?category=Men"
                  className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full w-fit overflow-hidden transition-all active:scale-95 shadow-xl"
                >
                  <span className="relative z-10 text-[10px] font-black uppercase tracking-widest">
                    Shop Now
                  </span>
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 group-hover/btn:text-white transition-colors">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* WOMEN (ROW 1) */}
          <div className="group relative cursor-pointer h-[300px] md:h-full animate-slideLeft will-change-both animate-delay-200">
            <div className="relative h-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/10 border border-black/5">
              <img
                src="https://images.unsplash.com/photo-1524255684952-d7185b509571"
                alt="Women's collection"
                className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-4">
                  Women
                </h3>

                <Link
                  to="/catalog?category=Women"
                  className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-white w-fit pb-1 hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>

          {/* EXPLORE (ROW 2) */}
          <div className="group relative cursor-pointer h-[300px] md:h-full animate-slideLeft will-change-both animate-delay-300">
            <div className="relative h-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/10 border border-black/5">
              <img
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
                alt="Explore products"
                className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-4">
                  New Drops
                </h3>

                <Link
                  to="/catalog"
                  className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-white w-fit pb-1 hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                >
                  Browse All →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Collections;
