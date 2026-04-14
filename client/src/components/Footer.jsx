import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSettings, getCategories } from "../api/productApi";

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [settingsData, catData] = await Promise.all([
          getSettings(),
          getCategories(),
        ]);
        setSettings(settingsData);
        setCategories(catData);
      } catch (err) {
        console.error("Footer data load error:", err);
      }
    })();
  }, []);

  const contact = settings?.contact || {};
  const socials = settings?.socials || {};

  return (
    <footer className="bg-zinc-950 text-white relative overflow-hidden border-t border-white/5">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-30" />

      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div className="space-y-8">
            <Link to="/" className="inline-block group">
              <h2 className="text-4xl font-black tracking-tighter transition-all group-hover:scale-110 group-active:scale-95">
                HRS<span className="text-indigo-600">3</span>
              </h2>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-xs">
              {settings?.about ||
                "Elevate your everyday style with premium quality apparel. Timeless fits and superior comfort designed for you."}
            </p>
            <div className="flex gap-6">
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <span className="text-xs font-black uppercase tracking-widest">
                    Instagram
                  </span>
                </a>
              )}
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <span className="text-xs font-black uppercase tracking-widest">
                    Facebook
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* SHOP */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-zinc-500">
              Shop
            </h3>
            <ul className="space-y-4">
              {(Array.isArray(categories) ? categories : [])
                .slice(0, 4)
                .map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/catalog?category=${cat.name}`}
                      className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors font-bold uppercase tracking-tight"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  to="/customize"
                  className="text-sm text-white hover:text-indigo-400 transition-colors font-black uppercase tracking-tight flex items-center gap-2"
                >
                  Custom Drops
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-zinc-500">
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors font-bold uppercase tracking-tight"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faqs"
                  className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors font-bold uppercase tracking-tight"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <button className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors font-bold uppercase tracking-tight">
                  Shipping Policy
                </button>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-zinc-500">
              Stay Connected
            </h3>
            <p className="text-sm text-zinc-400 font-medium mb-6">
              Subscribe to get notified about fresh drops.
            </p>
            <div className="relative group">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="w-full bg-zinc-900 border-none rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 ring-indigo-500 transition-all placeholder:text-zinc-600"
              />
              <button className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-20 md:flex-row">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} HRS3 Premium. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            <button className="hover:text-white transition-colors">
              Privacy
            </button>
            <button className="hover:text-white transition-colors">
              Terms
            </button>
            <button className="hover:text-white transition-colors">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
