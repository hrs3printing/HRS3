import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setSubmitted(true);
    } catch (error) {
      alert(error.response?.data?.message || "Could not submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Forgot Password
        </h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Enter your email and we&apos;ll send a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-600 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {submitted && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
            If the account exists, a password reset link has been sent.
          </p>
        )}

        <p className="mt-6 text-center text-xs text-zinc-500">
          Remembered it?{" "}
          <Link to="/login" className="text-indigo-600 underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
