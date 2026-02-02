import React, { useState } from "react";

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
    background: "#ffffff",
    borderRadius: "18px",
    padding: "40px 36px",
    textAlign: "center",
    boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
  },
  logo: {
    width: "72px",
    marginBottom: "20px",
    marginLeft: "135px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "6px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "15px",
    marginBottom: "28px",
  },
  label: {
    display: "block",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "6px",
    marginTop: "16px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    marginTop: "26px",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(180deg, #0f172a, #020617)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginTop: "10px",
    textAlign: "left",
  },
  success: {
    color: "green",
    fontSize: "13px",
    marginTop: "10px",
    textAlign: "left",
  },
};

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp+password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /* STEP 1: SEND OTP */
  const sendOtp = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://secure.madhatv.in/api/v2/resetpassword.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (data.error === false) {
        setSuccess("OTP sent to your email");
        setStep(2);
      } else {
        setError(data.error_msg || "Failed to send OTP");
      }
    } catch (e) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* STEP 2: VERIFY OTP & RESET PASSWORD */
  const verifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!otp || !password) {
      setError("OTP and new password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://secure.madhatv.in/api/v2/verify-otp.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp,
            new_password: password,
          }),
        }
      );

      const data = await res.json();

      if (data.error === false) {
        setSuccess("Password reset successful. You can login now.");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setError(data.error_msg || "Invalid OTP");
      }
    } catch (e) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7c6eaa7ad_madhatv-fav.png"
          alt="Madha TV"
          style={styles.logo}
        />

        <h2 style={styles.title}>Forgot Password</h2>
        <p style={styles.subtitle}>
          {step === 1
            ? "Enter your email to receive OTP"
            : "Enter OTP and set new password"}
        </p>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <button style={styles.button} onClick={sendOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <label style={styles.label}>OTP</label>
            <input
              style={styles.input}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />

            <label style={styles.label}>New Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
            />

            <button style={styles.button} onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Reset Password"}
            </button>
          </>
        )}

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
      </div>
    </div>
  );
}