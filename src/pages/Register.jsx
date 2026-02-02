import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth";

/* ===============================
   COUNTRY + STATE DATA
================================ */
const COUNTRY_STATE = {
  India: ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana","Pondicherry","Andaman and Nicobar Islands","Assam","Bihar"],
  USA: ["California", "Texas", "Florida", "New York"],
  UK: ["England", "Scotland", "Wales"],
  Australia: ["New South Wales", "Victoria", "Queensland"],

};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6fb",
    
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    position:"absolute",
    width: "500px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
  },
  logo: {
    width: "72px",
    display: "block",
    margin: "0 auto 20px",
  },
  title: {
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px 24px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#eef4ff",
    outline: "none",
    fontSize: "14px",
  },
  row: {
    gridColumn: "1 / -1",
    textAlign: "center",
    marginTop: "24px",
  },
  button: {
    padding: "12px 22px",
    borderRadius: "10px",
    border: "none",
    background: "black",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginLeft: "12px",
  },

  buttonSecondary: {
    padding: "12px 22px",
    borderRadius: "10px",
    border: "none",
    background: "#1C4D8D",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginTop: "10px",
    textAlign: "center",
  },
};

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    state: "",
    city: "",
    mobile: "",
    zipcode: "",
    address1: "",
    address2: "",
    country_code: "+91",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* HANDLE CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Country change → reset state
    if (name === "country") {
      setForm({ ...form, country: value, state: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  /* SUBMIT */
const handleRegister = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.name || !form.email || !form.password || !form.country || !form.state || !form.city) {
    setError("Please fill all required fields");
    return;
  }

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setLoading(true);

  try {
    const payload = {
      name: form.name,
      email_id: form.email,
      password: form.password,
      country_code: form.country_code,
      mobile: form.mobile,
      address1: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      country: form.country,
      zipcode: form.zipcode,
    };

    const res = await registerApi(payload);
    console.log("REGISTER API RESPONSE 👉", res);

    // ✅ SAFE SUCCESS CHECK
    if (res && (res.error === false || res.error === "false")) {

      // ✅ STORE ONLY WHAT YOU NEED
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user_name", form.name.trim());
      localStorage.setItem("user_email", form.email.trim());
      
  console.log("EMAIL SAVED 👉", localStorage.getItem("user_email"));

      alert("Registration Successful");

      // 🔁 IMPORTANT: go to HOME, not Login
      navigate("/");
    } else {
      setError(res?.message || "Registration failed");
    }

  } catch (err) {
    console.error("REGISTER ERROR 👉", err);
    setError("Server error. Try again later.");
  } finally {
    setLoading(false);
  }
};




  return (
    
    <div style={styles.page}>
<div style={{position: "relative", width: "100vw", height: "100vh"}}>
  <img src="/Bg.png" style={{width: "100%" ,height: "100%", objectFit: "cover"}}/>
  <div style={{position: "absolute", top: "0", left: "0", width: "100%", height:" 100%", backgroundColor: "rgba(0, 0, 0, 0.5)"}}/>
</div>

      <div style={styles.card}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7c6eaa7ad_madhatv-fav.png"
          alt="Madha TV"
          style={styles.logo}
        />

        <h2 style={styles.title}>Sign Up</h2>

        <form onSubmit={handleRegister}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Name*</label>
              <input name="name" value={form.name} onChange={handleChange} style={styles.input} placeholder="Name"/>
            </div>

            <div>
              <label style={styles.label}>Address*</label>
              <input name="address1" value={form.address1} onChange={handleChange} style={styles.input} placeholder="Address"/>
            </div>

            <div>
              <label style={styles.label}>Email*</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} style={styles.input} placeholder="Email"  autoComplete="off" />
            </div>

            <div>
              <label style={styles.label}>Country*</label>
              <select name="country" value={form.country} onChange={handleChange} style={styles.input}>
                <option value="">Select Country</option>
                {Object.keys(COUNTRY_STATE).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Password*</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" style={styles.input}  autoComplete="new-password"/>
            </div>

            <div>
              <label style={styles.label}>State*</label>
              <select name="state" value={form.state} onChange={handleChange} style={styles.input}>
                <option value="">Select State</option>
                {(COUNTRY_STATE[form.country] || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Confirm Password*</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" style={styles.input} />
            </div>

            <div>
              <label style={styles.label}>City*</label>
              <input name="city" value={form.city} onChange={handleChange} style={styles.input} placeholder="City"/>
            </div>

            <div>
              <label style={styles.label}>Phone Number*</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Phone Number" style={styles.input} />
            </div>

            <div>
              <label style={styles.label}>Zip / Pin Code*</label>
              <input name="zipcode" value={form.zipcode} onChange={handleChange} placeholder="Pincode" style={styles.input} />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.row}>
            <button type="button" style={styles.buttonSecondary} onClick={() => navigate("/Login")}>
              ← Login
            </button>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
