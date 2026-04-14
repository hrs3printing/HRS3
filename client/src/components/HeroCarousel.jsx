import { useEffect, useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { getHeroSlides } from "../api/productApi";
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";

const fallbackSlides = [
  {
    image: { url: hero1 },
    title: "Elevate Your Everyday Style",
    subtitle: "Timeless fits. Superior comfort. Effortless drip.",
  },
  {
    image: { url: hero2 },
    title: "Premium Quality Prints",
    subtitle: "High quality materials & long lasting prints",
  },
  {
    image: { url: hero3 },
    title: "Wear Your Identity",
    subtitle: "Premium tees designed for everyday confidence",
  },
];

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const slidesList = Array.isArray(slides) ? slides : [];

  const fetchSlides = useCallback(async () => {
    try {
      const data = await getHeroSlides();
      setSlides(Array.isArray(data) && data.length > 0 ? data : fallbackSlides);
    } catch {
      setSlides(fallbackSlides);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (slidesList.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slidesList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slidesList.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slidesList.length) % slidesList.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slidesList.length);
  };

  if (slidesList.length === 0) return <div className="h-[65vh] bg-zinc-900" />;

  return (
    <div className="group relative w-full overflow-hidden bg-zinc-900 animate-fadeIn will-change-opacity">
      <div
        className="flex h-[65vh] min-h-105 max-h-195 transition-transform duration-700 sm:h-[75vh] md:h-[85vh] will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slidesList.map((slide, index) => (
          <div
            key={index}
            className="w-full h-full shrink-0 relative bg-zinc-900"
          >
            <img
              src={slide.image?.url || slide.image}
              alt={slide.title}
              className="w-full h-full object-cover opacity-0 transition-opacity duration-700"
              onLoad={(e) => e.target.classList.remove("opacity-0")}
              decoding="async"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
            />

            <div className="absolute inset-0 bg-black/40" />

            <div
              className={`absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white sm:px-8 transition-all duration-700 ${
                current === index
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8 pointer-events-none"
              }`}
            >
              <h1 className="mb-3 sm:mb-4 max-w-4xl text-2xl sm:text-3xl md:text-5xl font-semibold leading-tight animate-fadeUp">
                {slide.title}
              </h1>

              <p className="mb-5 sm:mb-6 max-w-md sm:max-w-xl text-xs sm:text-sm md:text-base text-white/85 animate-fadeUp animate-delay-200">
                {slide.subtitle}
              </p>

              {/* <Link
                to="/catalog"
                className="bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-black rounded-md transition-transform hover:scale-105 active:scale-95 animate-fadeUp animate-delay-300"
              >
                Shop Now
              </Link> */}
            </div>
          </div>
        ))}
      </div>

      {/* ARROWS (BETTER TOUCH + CLEAN MOBILE) */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-4 py-3 text-sm backdrop-blur"
      >
        ◀
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-4 py-3 text-sm backdrop-blur"
      >
        ▶
      </button>
    </div>
  );
};

export default HeroCarousel;
