import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(
    () => decodeURIComponent(searchParams.get("email") || "").trim(),
    [searchParams],
  );

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;

      try {
        setLoading(true);
        await api.post("/auth/verify-email", {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        });
        window.dispatchEvent(new Event("userChanged"));
        alert("Email verified successfully. You are now logged in.");
        navigate("/");
      } catch (error) {
        alert(error.response?.data?.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    },
    [email, otp, loading, navigate],
  );

  const handleResend = useCallback(async () => {
    if (!email.trim()) {
      alert("Enter your email first.");
      return;
    }
    try {
      await api.post("/auth/resend-verification", {
        email: email.trim().toLowerCase(),
      });
      alert("Verification OTP sent.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to resend OTP");
    }
  }, [email]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Verify Email
        </h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Enter the OTP sent to your inbox.
        </p>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-indigo-600"
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit OTP"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-indigo-600 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          className="mt-4 w-full rounded-xl border border-zinc-300 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-700 hover:bg-zinc-50"
        >
          Resend OTP
        </button>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Already verified?{" "}
          <Link to="/login" className="text-indigo-600 underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
