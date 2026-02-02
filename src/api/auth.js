import axios from "axios";
import apiClient from "./apiClient";
/* ===============================
   AUTH STATE HELPERS (Frontend)
   =============================== */

export const isAuthenticated = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};

// export const loginUser = (user) => {
//   localStorage.setItem("isLoggedIn", "true");
//   localStorage.setItem("user", JSON.stringify(user));
//   localStorage.setItem("role", user.role || "user");
// };


export const loginUser = (user) => {
  localStorage.setItem("isLoggedIn", "true");

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role || user.user_type || "user");
  }

  
};


export const logoutUser = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("user");
};
// ... existing code ...

export const getUserRole = () => {
  return localStorage.getItem("role");
};

// --- IDHAI INGAE ADD SEIYUNGAL ---
export const getLoggedInUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  }
  return null;
};
// --------------------------------



/* ===============================
   REGISTER API
================================ */
export const registerApi = async (payload) => {
  const response = await apiClient.post("register.php", payload);
  return response.data;
};

/* ===============================
   LOGIN API
================================ */
export const loginApi = async (email, password) => {
  const response = await apiClient.post("login.php", {
    email,
    password,
    ip: "web",
  });

  return response.data;
};


/* ===============================
   AUTH STATE HELPERS
================================ */

// export const isAuthenticated = () => {
//   return localStorage.getItem("isLoggedIn") === "true";
// };

// export const getUser = () => {
//   return JSON.parse(localStorage.getItem("user"));
// };

// export const getRole = () => {
//   return localStorage.getItem("role");
// };

// export const loginUser = (user) => {
//   localStorage.setItem("isLoggedIn", "true");
//   localStorage.setItem("user", JSON.stringify(user));
//   localStorage.setItem("role", user.role); // 🔑 IMPORTANT
// };

// export const logoutUser = () => {
//   localStorage.removeItem("isLoggedIn");
//   localStorage.removeItem("user");
//   localStorage.removeItem("role");
// };



