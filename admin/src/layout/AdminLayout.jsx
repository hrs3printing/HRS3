import { useState, useEffect } from "react";
import { Outlet, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

const storeUrl =
  import.meta.env.VITE_STORE_URL?.replace(/\/$/, "") || "https://hrs3.in";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const nav = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/products", label: "Products" },
    { to: "/orders", label: "Orders" },
    { to: "/hero", label: "Hero Banner" },
    { to: "/categories", label: "Categories" },
    { to: "/settings", label: "Settings" },
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();

    const onUserChange = () => {
      void loadUser();
    };
    window.addEventListener("userChanged", onUserChange);
    return () => window.removeEventListener("userChanged", onUserChange);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const lockScroll = () => {
      if (sidebarOpen && mq.matches) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };
    lockScroll();
    mq.addEventListener("change", lockScroll);
    return () => {
      mq.removeEventListener("change", lockScroll);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setUser(null);
    window.dispatchEvent(new Event("userChanged"));
    navigate("/login", { replace: true });
  };

  const closeNav = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">
        Checking session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-zinc-300">
        <p className="text-lg font-medium text-white">Access denied</p>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          This account is not an admin. Sign in with an admin user or ask the
          owner to run the promote script.
        </p>
        <a
          href={storeUrl}
          className="mt-6 text-sm text-white underline underline-offset-4"
        >
          Back to store
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-800 bg-zinc-950/95 px-3 backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Open navigation menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">HRS3 Admin</span>
      </header>

      {/* Dim backdrop when drawer open */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={closeNav}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[min(100%,16rem)] flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-56 lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-zinc-800 p-4">
          <div className="flex items-start justify-between gap-2 lg:block">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                HRS3
              </p>
              <h1 className="mt-1 text-lg font-semibold text-white">Admin</h1>
              <a
                href={storeUrl}
                className="mt-3 inline-block text-xs text-zinc-400 transition hover:text-white"
              >
                ← Back to store
              </a>
            </div>
            <button
              type="button"
              onClick={closeNav}
              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeNav}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-white font-medium text-black"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-zinc-800 p-3">
          <p className="truncate px-2 text-xs text-zinc-500">{user.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-lg px-2 py-2 text-left text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 overflow-y-auto bg-zinc-900 pt-14 lg:pt-0">
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
