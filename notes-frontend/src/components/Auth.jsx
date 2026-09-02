import { useState } from "react";
import axios from "axios";

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      // Save token and user info to LocalStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during authentication.");
    }
  };

  return (
    <div style={{ width: "400px", margin: "50px auto", padding: "25px", backgroundColor: "#007367", borderRadius: "10px", color: "white" }}>
      <h2>{isLogin ? "Login to G-NOTES" : "Create G-NOTES Account"}</h2>
      {error && <p style={{ color: "#ffcccc", fontWeight: "bold" }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ width: "100%", margin: "0", padding: "0", boxShadow: "none" }}>
        {!isLogin && (
          <div>
            <label style={{ margin: 0 }}>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
          </div>
        )}
        
        <div>
          <label style={{ margin: 0 }}>GITAM Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@gitam.in" />
        </div>

        <div>
          <label style={{ margin: 0 }}>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter password" />
        </div>

        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center", cursor: "pointer", textDecoration: "underline" }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Register here" : "Already have an account? Login here"}
      </p>
    </div>
  );
};

export default Auth;