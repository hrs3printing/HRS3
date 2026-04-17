import { memo } from "react";

import HeroCarousel from "../components/HeroCarousel";
import CategoryCarousel from "../components/CategoryCarousel";
import NewArrivals from "../components/NewArrivals";
import Quality from "../components/Quality";
import FAQ from "../components/FAQ";

const Home = () => {
  return (
    <div className="flex flex-col gap-10 sm:gap-20">
      <HeroCarousel />
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8">
        <CategoryCarousel />
        <div className="mt-10 sm:mt-20">
          <NewArrivals />
        </div>
      </div>
      
      <Quality />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 mb-20 sm:mb-32">
        <FAQ />
      </div>
    </div>
  );
};

export default memo(Home);
