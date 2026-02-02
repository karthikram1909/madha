import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

import { loginApi } from "../api/auth";


const styles = {
  page: {
    height: "100vh",
    background: "#f4f6fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "420px",
    position:"absolute",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "40px 36px",
    textAlign: "center",
    boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
  },

  logo: {
    width: "72px",
    marginBottom: "20px",
    marginLeft: "135px"
  },

  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "6px",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "15px",
    marginBottom: "32px",
  },

  label: {
    display: "block",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "6px",
    marginTop: "16px",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px 14px",
    background: "#f8fafc",
  },

  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: "14px",
    marginLeft: "10px",
  },

  button: {
    width: "100%",
    marginTop: "26px",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(180deg, #0f172a, #020617)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  footerRow: {
    marginTop: "22px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  },

  link: {
    color: "#64748b",
    textDecoration: "none",
  },

  linkBold: {
    color: "#0f172a",
    fontWeight: "600",
    textDecoration: "none",
  },

  error: {
    color: "red",
    fontSize: "13px",
    marginTop: "10px",
    textAlign: "left",
  },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();



const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await loginApi(email, password);
    console.log("LOGIN RESPONSE 👉", res);

    if (
      res?.error === false &&
      Array.isArray(res?.User_details) &&
      res.User_details.length > 0
    ) {
      const user = res.User_details[0];
      console.log("USER OBJECT 👉", user);

      // 🔑 FIX ROLE MAPPING
      const role = user.role || user.user_type || "user";

      // 🔐 AUTH STATE
   loginUser({
  role: role
});


      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user_name", user.name);
      localStorage.setItem("user_email", user.email);
      localStorage.setItem("role", role);

      // 🔁 Notify navbar
      window.dispatchEvent(new Event("authChanged"));
// 🔁 POST LOGIN ACTION (PAYMENT / BOOKING REDIRECT)
const pending = localStorage.getItem("madha_tv_post_login_action");

if (pending) {
  try {
    const data = JSON.parse(pending);

    // cleanup will be done after auto-payment trigger
    navigate(data.redirectTo || "/BookService", { replace: true });
    return;
  } catch (e) {
    console.error("Invalid post login action data", e);
    localStorage.removeItem("madha_tv_post_login_action");
  }
}

      // 🔁 Payment redirect
      const redirectPath = localStorage.getItem("postLoginRedirect");
      if (redirectPath) {
        localStorage.removeItem("postLoginRedirect");
        navigate(redirectPath, { replace: true });
        return;
      }

      // 🔁 Role based redirect
      if (role === "Admin") {
        navigate("/Dashboard", { replace: true });
      } else {
        navigate("/UserDashboard", { replace: true });
      }
    } else {
      setError(res?.error_msg || "Invalid email or password");
    }
  } catch (err) {
    console.error("LOGIN ERROR 👉", err);
    setError("Login failed. Please try again.");
  }
};




  const handleForgetPassword = () => {
    // console.log("Forget password");

    navigate("/ForgetPassword");
  }



  return (
    <div style={styles.page}>
<div style={{position: "relative", width: "100vw", height: "100vh"}}>
  <img src="/Bg.png" style={{width: "100%" ,height: "100%", objectFit: "cover"}}/>
  <div style={{position: "absolute", top: "0", left: "0", width: "100%", height:" 100%", backgroundColor: "rgba(0, 0, 0, 0.5)"}}/>
</div>

      <div style={styles.card}>
        {/* LOGO */}
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7c6eaa7ad_madhatv-fav.png"
          alt="Madha TV"
          style={styles.logo}
        />

        <h2 style={styles.title}>Welcome to Madha TV</h2>
        <p style={styles.subtitle}>Sign in to continue</p>

        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrapper}>
            {/* <span>📧</span> */}
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* PASSWORD */}
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            {/* <span>🔒</span> */}
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button}>
            Sign in
          </button>
        </form>

        {/* FOOTER */}
        <div style={styles.footerRow}>
          <button onClick={handleForgetPassword} style={styles.link}>
            Forgot password?
          </button>

          <Link to="/Register" style={styles.linkBold}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
