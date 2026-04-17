import { useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/login", form);
      window.dispatchEvent(new Event("userChanged"));
      toast.success("Access Granted");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white animate-fadeIn">
      {/* LEFT: VISUAL */}
      <div className="hidden lg:flex relative items-center justify-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070"
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Premium Fashion"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-md text-center px-12 animate-fadeUp will-change-both">
          <span className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">
            Premium Access
          </span>
          <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-8">
            Welcome <span className="text-zinc-500">Back</span>
          </h1>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed">
            Re-enter the archive of premium essentials and exclusive drops.
          </p>
        </div>

        {/* Floating elements */}
        <div className="absolute bottom-12 left-12 flex items-center gap-4">
          <div className="h-px w-12 bg-indigo-600" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            HRS3 Archive v2.0
          </span>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex items-center justify-center p-8 sm:p-12 md:p-20">
        <div className="w-full max-w-md space-y-12 animate-slideLeft will-change-both">
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
              Sign In
            </h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Enter your credentials to access the archive.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1 group-focus-within:text-indigo-600 transition-colors">
                  Digital Identity
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1 group-focus-within:text-indigo-600 transition-colors">
                  Security Key
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="PASSWORD"
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10">
              Access Account
            </button>
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 underline underline-offset-4 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </form>

          <div className="pt-8 border-t border-zinc-100 flex flex-col items-center gap-6">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              New to the archive?{" "}
              <Link
                to="/signup"
                className="text-indigo-600 hover:text-black underline underline-offset-4 transition-colors"
              >
                Initialize Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Login);
