import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Loader, ChevronRight, Fingerprint } from "lucide-react";
import axios from "axios";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      // THE SUPREME LEADER CHECK: Boot them out if they aren't an admin
      if (data.role !== "admin") {
        alert("ACCESS DENIED: Insufficient Clearance Level. This portal is for System Administrators only.");
        setLoading(false);
        return;
      }

      // If they are the Admin, save data and let them in
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/admin-dashboard");
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Authentication Failed";
      alert("System Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Abstract Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      </div>

      {/* The Vault Door (Login Card) */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 transform transition-all">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/50 mb-6 border border-blue-500/30">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">System Override</h1>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">Super Administrator Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Admin Identity</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-500" />
              </div>
              <input
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block pl-11 p-3.5 outline-none transition-all placeholder-slate-700 font-medium"
                placeholder="admin@empire.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Clearance Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input
                type="password"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block pl-11 p-3.5 outline-none transition-all placeholder-slate-700 font-medium"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading ? "bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/50 transform hover:-translate-y-1"
            }`}
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Fingerprint size={20} />}
            {loading ? "Verifying Clearance..." : "Bypass Security"}
            {!loading && <ChevronRight size={18} className="ml-1" />}
          </button>
        </form>

        {/* Footer Warning */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Unauthorized access is strictly monitored.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;