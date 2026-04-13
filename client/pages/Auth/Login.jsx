import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import useUserStore from "../../store/userStore";

const Login = () => {
  const navigate = useNavigate();
  const setToken = useUserStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);

  const [form, setForm] = useState({
    erpId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!form.erpId || !form.password) {
      setError("Please fill all fields ❌");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", form);

      setToken(res.data.token);
      setUser(res.data.user);

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid ERP credentials ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-2 text-center">ERP System 🔐</h1>
        <p className="text-center text-gray-400 mb-6">Sign in to your account</p>

        <input
          type="text"
          placeholder="College ID / ERP ID"
          value={form.erpId}
          onChange={(e) =>
            setForm({ ...form, erpId: e.target.value })
          }
          onKeyPress={handleKeyPress}
          className="w-full mb-3 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          onKeyPress={handleKeyPress}
          className="w-full mb-2 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 py-3 rounded-lg font-semibold text-white transition flex justify-center items-center"
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Your ERP credentials are securely used to fetch your academic data.
        </p>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-300">
            <strong>Demo Credentials:</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">ID: 12345 | Password: password</p>
        </div>
      </div>
    </div>
  );
};

export default Login;