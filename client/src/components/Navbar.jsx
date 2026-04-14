import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { memo, useMemo, useState, useEffect } from "react";
import api from "../api/axios";
import { getSettings } from "../api/productApi";
import defaultLogo from "../assets/logo.png";

const Navbar = () => {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const cartCount = useMemo(() => cart.length, [cart]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/auth/session");
        setUser(data.authenticated ? data.user : null);
      } catch {
        setUser(null);
      }
    };

    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Navbar settings load error:", err);
      }
    };

    void loadUser();
    loadSettings();

    const onUserChange = () => {
      void loadUser();
    };
    window.addEventListener("storage", onUserChange);
    window.addEventListener("userChanged", onUserChange);

    return () => {
      window.removeEventListener("storage", onUserChange);
      window.removeEventListener("userChanged", onUserChange);
    };
  }, []);

  const logoData = useMemo(() => {
    return {
      url: settings?.logo?.url || defaultLogo,
      width: settings?.logo?.width || 150,
    };
  }, [settings]);

  const adminUrl = useMemo(() => {
    const configured = import.meta.env.VITE_ADMIN_URL?.trim();
    if (configured) return configured.replace(/\/$/, "");
    return "https://admin.hrs3.in";
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${searchTerm}`);
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  const navLinks = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/catalog", label: "Catalog" },
      { to: "/customize", label: "Customize" },
      { to: "/contact", label: "Contact" },
      { to: "/faqs", label: "FAQs" },
    ],
    [],
  );

  const accountLinks = useMemo(
    () => [
      { to: "/login", label: "Login" },
      { to: "/signup", label: "Signup" },
    ],
    [],
  );

  const linkClassName = ({ isActive }) =>
    `rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
      isActive
        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }

    window.dispatchEvent(new Event("userChanged"));
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full animate-fadeIn will-change-opacity">
      <div className="border-b border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(16,24,40,0.06)]">
        <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-20 sm:px-6">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-600 transition-all hover:border-zinc-300 hover:text-black active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>

          <div className="hidden w-1/3 items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClassName}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <Link
            to="/"
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl px-2 py-1 transition-transform hover:scale-105 active:scale-95"
          >
            <img
              src={logoData.url}
              style={{ width: `${logoData.width}px` }}
              className="max-h-10 w-auto max-w-[min(112px,32vw)] object-contain sm:max-h-16 sm:max-w-none"
              alt="HRS3 Logo"
            />
          </Link>

          <div className="ml-auto flex w-1/3 items-center justify-end gap-1 sm:gap-2 lg:ml-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-600 transition-all hover:border-zinc-300 hover:text-black active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>

            <div className="hidden items-center gap-3 lg:flex">
              {user ? (
                <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                  <span className="text-xs font-semibold text-zinc-700">
                    Hi, {user.name?.split(" ")[0] || "User"}
                  </span>
                  {user.role === "admin" && (
                    <a
                      href={adminUrl}
                      className="rounded-full bg-zinc-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white transition-colors hover:bg-indigo-600"
                    >
                      Admin
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-[10px] font-black uppercase tracking-[0.15em] text-red-500 transition-colors hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                accountLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={linkClassName}>
                    {link.label}
                  </NavLink>
                ))
              )}
            </div>

            <NavLink
              to="/cart"
              className="relative rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-600 transition-all hover:border-zinc-300 hover:text-black active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.112 8.902a2.25 2.25 0 0 1-2.244 2.53H6.026a2.25 2.25 0 0 1-2.244-2.53l1.112-8.902a2.25 2.25 0 0 1 2.244-2.067H17.54a2.25 2.25 0 0 1 2.244 2.067Z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </nav>
      </div>

      <div
        className={`fixed inset-x-0 top-0 z-70 border-b border-zinc-200 bg-white/95 px-3 py-3 backdrop-blur-xl transition-all duration-300 sm:px-6 ${
          searchOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <form
          onSubmit={handleSearch}
          className="mx-auto flex h-14 max-w-7xl items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 shadow-lg shadow-zinc-900/5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5 text-zinc-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            autoFocus
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-zinc-800 outline-none placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-indigo-600"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="rounded-full p-2 text-zinc-500 transition-colors hover:text-black"
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
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </form>
      </div>

      <div
        className={`fixed inset-0 z-60 lg:hidden transition-all duration-500 ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        />

        <div
          className={`absolute left-0 top-0 h-full w-[min(100%,22rem)] max-w-sm border-r border-zinc-200 bg-linear-to-b from-white to-zinc-50 p-5 sm:p-6 shadow-2xl transition-transform duration-500 ease-[0.16,1,0.3,1] ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <img
              src={logoData.url}
              style={{ width: `${logoData.width}px` }}
              className="max-h-12 w-auto max-w-[min(120px,45vw)] object-contain sm:max-h-16 sm:max-w-none"
              alt="HRS3 Logo"
            />
            <button
              onClick={() => setMenuOpen(false)}
              className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 transition-colors hover:text-black"
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

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                Menu
              </p>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-base font-semibold transition ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:bg-white hover:text-black"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="h-px bg-zinc-200/70" />

            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                Account
              </p>
              {user ? (
                <>
                  <div className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm">
                    Hi, {user.name}
                  </div>
                  {user.role === "admin" && (
                    <a
                      href={adminUrl}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-white hover:text-black"
                    >
                      Admin Dashboard
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-3 py-2 text-left text-sm font-medium text-red-500 transition-colors hover:bg-white hover:text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                accountLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-base font-medium text-zinc-600 transition-colors hover:bg-white hover:text-black"
                  >
                    {link.label}
                  </NavLink>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Navbar);
