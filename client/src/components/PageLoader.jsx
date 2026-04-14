const PageLoader = () => (
  <div
    className="flex min-h-[50vh] items-center justify-center"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span className="sr-only">Loading page</span>
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
  </div>
);

export default PageLoader;
