import { useState } from "react";
import api from "../api";

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await api.post(endpoint, formData);
      onLoginSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <div className="panel-heading">
        <span className="eyebrow">YOUR STUDY SPACE</span>
        <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
        <p>{isLogin ? "Sign in to share and manage your notes." : "Join your classmates and keep notes in one place."}</p>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}

      <form className="stacked-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <label>
            Full name
            <input type="text" name="name" value={formData.name} onChange={handleChange} required autoComplete="name" placeholder="Enter your name" />
          </label>
        )}

        <label>
          Email address
          <input type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} required autoComplete={isLogin ? "current-password" : "new-password"} placeholder="Enter your password" />
        </label>

        <button className="button button-primary button-wide" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        {isLogin ? "New to G-NOTES?" : "Already have an account?"}
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setIsLogin((current) => !current);
            setError("");
          }}
        >
          {isLogin ? "Create an account" : "Sign in"}
        </button>
      </p>
    </section>
  );
};

export default Auth;