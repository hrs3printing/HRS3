/**
 * Consistent page wrapper: white background, full viewport min-height.
 */
export function PageShell({ children, className = "" }) {
  return (
    <div className={`bg-white min-h-screen ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * Top hero band (zinc-50) used across Products, FAQs, Contact, Cart, etc.
 * - align="center": centered title + double-line subtitle (FAQs style)
 * - align="left": left title + single accent line (Products / Contact style)
 */
export function PageHero({
  title,
  accent,
  subtitle,
  align = "left",
  size = "default",
  headerRight,
  children,
}) {
  const padding =
    size === "compact" ? "py-8 sm:py-10" : "py-10 sm:py-14 lg:py-20";

  const titleEl =
    title != null && title !== "" ? (
      <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter text-black leading-none mb-4 sm:mb-6">
        {title}{" "}
        {accent != null && accent !== "" && (
          <span className="text-zinc-200">{accent}</span>
        )}
      </h1>
    ) : null;

  const subtitleEl =
    subtitle != null && subtitle !== "" ? (
      align === "center" ? (
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-indigo-600" />
          <p className="text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">
            {subtitle}
          </p>
          <span className="h-px w-8 bg-indigo-600" />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-indigo-600" />
            <p className="text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">
              {subtitle}
            </p>
          </div>
        </div>
      )
    ) : null;

  const inner =
    headerRight != null ? (
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className={align === "center" ? "text-center md:text-left" : ""}>
          {titleEl}
          {subtitleEl}
          {children}
        </div>
        <div className="shrink-0">{headerRight}</div>
      </div>
    ) : (
      <div className={align === "center" ? "text-center" : ""}>
        {titleEl}
        {align === "left" && (subtitleEl || children) ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            {subtitleEl}
            {children}
          </div>
        ) : (
          <>
            {subtitleEl}
            {children}
          </>
        )}
      </div>
    );

  return (
    <div className="w-full border-b border-zinc-100 bg-zinc-50">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 ${padding}`}>
        <div className="animate-fadeUp will-change-both">{inner}</div>
      </div>
    </div>
  );
}

/**
 * Standard content area below PageHero (max width + vertical padding).
 */
export function PageContent({ children, className = "" }) {
  return (
    <div
      className={`mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 lg:py-20 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
