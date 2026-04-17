import { memo } from "react";

const features = [
  {
    title: "Premium Cotton",
    desc: "Crafted with high-quality breathable fabric for all-day comfort.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },
  {
    title: "Long-lasting Prints",
    desc: "Advanced printing techniques that don’t fade over time.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    title: "Perfect Fit",
    desc: "Tailored silhouettes designed for modern everyday wear.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
];

const Quality = () => {
  return (
    <section className="relative w-full py-32 bg-zinc-900 overflow-hidden animate-fadeIn will-change-opacity">
      {/* Decorative gradient background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)]" />

      <div className="w-full px-8 sm:px-12 lg:px-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 sm:gap-24 items-center">
          {/* CONTENT */}
          <div className="animate-slideRight will-change-both">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">
                  The HRS3 Standard
                </p>
                <h2 className="text-6xl sm:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.8] mb-6">
                  Engineered <br />
                  <span className="text-zinc-800">For Excellence</span>
                </h2>
              </div>

              <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-xl">
                Every piece in our archive undergoes a rigorous multi-stage
                quality check. We don't just sell apparel; we preserve a legacy
                of premium craftsmanship and timeless design.
              </p>

              <div className="grid sm:grid-cols-2 gap-8 pt-8">
                {features.map((feature, idx) => (
                  <div
                    key={feature.title}
                    className="space-y-3 animate-fadeUp will-change-both"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="h-10 w-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                      {feature.icon}
                    </div>
                    <h3 className="text-white text-xs font-black uppercase tracking-widest">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VISUAL */}
          <div className="relative animate-slideLeft will-change-both lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-xl aspect-square">
              {/* Main image card */}
              <div className="absolute inset-0 rounded-[3rem] sm:rounded-[5rem] overflow-hidden rotate-3 shadow-2xl shadow-black/50 group transition-transform duration-1000 hover:rotate-0">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e"
                  alt="Quality Assurance"
                  className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700" />
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 sm:-top-12 sm:-right-12 bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl -rotate-6 animate-fadeUp animate-delay-500 group-hover:rotate-0 transition-transform duration-700">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl sm:text-5xl font-black text-black">
                    100%
                  </span>
                  <span className="text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    Premium
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 sm:-bottom-12 sm:-left-12 bg-indigo-600 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl rotate-12 animate-fadeUp animate-delay-400 group-hover:rotate-0 transition-transform duration-700">
                <div className="flex items-center gap-3 sm:gap-5 text-white">
                  <div className="h-10 w-10 sm:h-14 sm:w-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <svg
                      className="w-5 h-5 sm:w-7 sm:h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                      Verified
                    </p>
                    <p className="text-xs sm:text-sm font-black uppercase tracking-widest">
                      Quality Control
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(Quality);
