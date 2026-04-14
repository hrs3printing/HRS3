import { memo } from "react";

import HeroCarousel from "../components/HeroCarousel";
import CategoryCarousel from "../components/CategoryCarousel";
import NewArrivals from "../components/NewArrivals";
import Quality from "../components/Quality";
import FAQ from "../components/FAQ";

const Home = () => {
  return (
    <div className="flex flex-col">
      <HeroCarousel />
      <div className="w-full">
        <CategoryCarousel />
        <div className="flex flex-col">
          <NewArrivals />
          <Quality />
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default memo(Home);
