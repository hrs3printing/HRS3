import { memo } from "react";

const ProductSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Image Container with rounded corners to match premium look */}
      <div className="bg-zinc-100 aspect-[3/4] rounded-[2rem] mb-6 shadow-sm border border-zinc-50" />

      {/* Title/Price info */}
      <div className="px-2 space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="h-4 bg-zinc-100 w-2/3 rounded-full" />
          <div className="h-4 bg-zinc-100 w-1/4 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-zinc-50 w-1/3 rounded-full" />
          <div className="flex gap-1">
            <div className="h-1 w-4 bg-zinc-50 rounded-full" />
            <div className="h-1 w-1 bg-zinc-50 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProductSkeleton);
