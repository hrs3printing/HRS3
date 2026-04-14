import { memo, useMemo } from "react";

const BANNER_LINES = [
  "🔥 20% OFF on all products",
  "🚚 Free Shipping Across India",
  "🎨 Customize Your Own Products",
  "⭐ Premium Quality Prints",
];

const TopBanner = () => {
  const bannerItems = useMemo(
    () =>
      [...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center">
          {BANNER_LINES.map((item, index) => (
            <span
              key={index}
              className="mx-3 sm:mx-6 md:mx-8 py-2 text-[10px] sm:text-xs md:text-sm font-medium whitespace-nowrap"
            >
              {item}
            </span>
          ))}
        </div>
      )),
    [],
  );

  return (
    <div className="w-full bg-black text-white overflow-hidden px-2 sm:px-0">
      <div className="flex w-max animate-marquee items-center min-h-8 sm:min-h-9">
        {bannerItems}
      </div>
    </div>
  );
};

export default memo(TopBanner);
