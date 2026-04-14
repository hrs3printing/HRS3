import { useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../api/adminApi";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminStats();
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled)
          setError(e?.response?.data?.message || "Could not load stats");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-zinc-500">Loading…</p>;
  }

  const cards = [
    { label: "Products", value: stats.productCount, to: "/products" },
    { label: "Orders", value: stats.orderCount, to: "/orders" },
    { label: "Customers", value: stats.userCount, to: null },
    {
      label: "Revenue (all time)",
      value: `₹${Number(stats.revenue).toLocaleString("en-IN")}`,
      to: "/orders",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Overview of your store performance.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {c.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                {c.value}
              </p>
            </>
          );
          if (c.to) {
            return (
              <Link
                key={c.label}
                to={c.to}
                className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 transition hover:border-zinc-600"
              >
                {inner}
              </Link>
            );
          }
          return (
            <div
              key={c.label}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(Dashboard);
