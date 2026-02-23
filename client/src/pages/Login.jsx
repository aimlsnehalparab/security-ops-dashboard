/*import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        { email, password }
      );

      if (res.data.mfaRequired) {
        localStorage.setItem("tempToken", res.data.tempToken);
        navigate("/mfa-verify");
      }
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Login</button>
      </form>
    </div>
  );
}

export default Login;*/
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // 🔐 CASE: MFA required
      if (data.mfaRequired) {
        localStorage.setItem("tempToken", data.tempToken);
        navigate("/mfa-verify");
      } else {
        // ✅ Normal login
        localStorage.setItem("accessToken", data.accessToken);
        navigate("/dashboard");
      }

    } catch (err) {
      setError("Server error");
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]">

    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl w-full max-w-md shadow-2xl">

      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🛡</div>
        <h1 className="text-2xl font-bold text-white">
          Security Operations Portal
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Authorized Access Only
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold text-white"
        >
          Secure Login
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        © 2026 Security Operations Dashboard
      </div>
    </div>
  </div>
);
}

export default Login;
