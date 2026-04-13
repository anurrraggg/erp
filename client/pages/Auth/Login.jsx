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
  const [showPassword, setShowPassword] = useState(false);

  const loginWithDemoData = () => {
    const demoUser = {
      name: "Demo Student",
      rollNo: form.erpId,
      email: `${form.erpId}@college.edu`,
    };

    setToken("demo-token");
    setUser(demoUser);
    navigate("/");
  };

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
      // Allow frontend-only flow using the demo credentials.
      if (form.erpId === "12345" && form.password === "password") {
        loginWithDemoData();
        return;
      }

      setError(err.response?.data?.message || "Invalid ERP credentials ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
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
          placeholder="College ID (2301640100100)"
          value={form.erpId}
          onChange={(e) =>
            setForm({ ...form, erpId: e.target.value })
          }
          onKeyDown={handleKeyDown}
          className="w-full mb-3 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />

        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            onKeyDown={handleKeyDown}
            className="w-full p-3 pr-16 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 hover:text-white"
            disabled={loading}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 py-3 rounded-lg font-semibold text-white transition flex justify-center items-center"
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Your ERP credentials are securely used and NOT being stored.
        </p>
      </div>
    </div>
  );
};

export default Login;