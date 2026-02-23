import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MfaVerify() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    const tempToken = localStorage.getItem("tempToken");

    try {
      const res = await fetch("http://localhost:5000/api/admin/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}`
        },
        body: JSON.stringify({ token: otp })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.removeItem("tempToken");

      navigate("/dashboard");

    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]">

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl w-full max-w-md shadow-2xl text-center">

        <div className="text-4xl mb-4">🔐</div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Multi-Factor Authentication
        </h1>

        <p className="text-gray-400 text-sm mb-8">
          Enter the 6-digit security code
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">

          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="------"
            className="tracking-[1em] text-center text-xl font-bold w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold text-white"
          >
            Verify & Continue
          </button>

        </form>

        <div className="mt-6 text-xs text-gray-500">
          Secure verification powered by MFA Engine
        </div>

      </div>
    </div>
  );
}

export default MfaVerify;