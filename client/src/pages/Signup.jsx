import { useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const { data } = await api.post("/auth/register", form);
      toast.success(
        data?.message ||
          "Signup successful. Please verify your email.",
      );
      const email = data?.verificationTarget?.email || form.email;
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white animate-fadeIn">
      {/* LEFT: VISUAL */}
      <div className="hidden lg:flex relative items-center justify-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Premium Production"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-md text-center px-12 animate-fadeUp will-change-both">
          <span className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">
            Join the Archive
          </span>
          <h1 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-8">
            Create <span className="text-zinc-500">Identity</span>
          </h1>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed">
            Gain exclusive access to limited drops and manage your premium
            collection.
          </p>
        </div>

        <div className="absolute bottom-12 left-12 flex items-center gap-4">
          <div className="h-px w-12 bg-indigo-600" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            HRS3 Registry v2.0
          </span>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="flex items-center justify-center p-8 sm:p-12 md:p-20">
        <div className="w-full max-w-md space-y-12 animate-slideLeft will-change-both">
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
              New Account
            </h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Register to start your premium journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1 group-focus-within:text-indigo-600 transition-colors">
                  Legal Name
                </label>
                <input
                  name="name"
                  placeholder="FULL NAME"
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1 group-focus-within:text-indigo-600 transition-colors">
                  Digital Reach
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
                  placeholder="CREATE PASSWORD"
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Initialize Account
            </button>
          </form>

          <div className="pt-8 border-t border-zinc-100 flex flex-col items-center gap-6">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Already in the archive?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-black underline underline-offset-4 transition-colors"
              >
                Access Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Signup);
