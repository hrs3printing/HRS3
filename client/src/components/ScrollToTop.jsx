import { useEffect, memo } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // safest across all devices
  }, [pathname]);

  return null;
};

export default memo(ScrollToTop);
