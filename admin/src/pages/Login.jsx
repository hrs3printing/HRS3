import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const storeUrl =
  import.meta.env.VITE_STORE_URL?.replace(/\/$/, "") || "https://hrs3.in";

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
      const { data } = await api.post("/auth/login", form);
      const user = data.user || data;
      if (user?.role !== "admin") {
        toast.error("This account is not an admin.");
        return;
      }
      window.dispatchEvent(new Event("userChanged"));
      navigate("/", { replace: true });
      toast.success("Signed in");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8">
        <h1 className="text-center text-xl font-semibold text-white">
          HRS3 Admin
        </h1>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Sign in with an admin account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Sign in
          </button>
        </form>

        <a
          href={storeUrl}
          className="mt-6 block text-center text-xs text-zinc-500 hover:text-zinc-300"
        >
          ← Customer store
        </a>
      </div>
    </div>
  );
};

export default Login;
