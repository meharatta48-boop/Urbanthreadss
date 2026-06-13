import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;
    const decodedJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp;
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // all users for admin

  // Load auth from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("authUser");
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        if (parsed?.token && isTokenExpired(parsed.token)) {
          localStorage.removeItem("authUser");
          localStorage.removeItem("authUsersList");
          setAuth(null);
          toast.info("Session expired. Please login again.");
        } else {
          setAuth(parsed);
        }
      } catch (e) {
        localStorage.removeItem("authUser");
        localStorage.removeItem("authUsersList");
        setAuth(null);
      }
    }
    const storedUsers = localStorage.getItem("authUsersList");
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        localStorage.removeItem("authUsersList");
      }
    }
    setLoading(false);
  }, []);

  // Periodically check for token expiration (every 10 seconds)
  useEffect(() => {
    if (!auth?.token) return;

    const checkExpiration = () => {
      if (isTokenExpired(auth.token)) {
        setAuth(null);
        setUsers([]);
        localStorage.removeItem("authUser");
        localStorage.removeItem("authUsersList");
        toast.info("Session expired. Logging out...");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 10000);
    return () => clearInterval(interval);
  }, [auth]);

  // LOGIN
  const login = async (formData) => {
    try {
      const { data } = await api.post("/auth/login", formData);

      if (!data?.token || !data?.user) {
        toast.error("Invalid login response");
        return null;
      }

      const authData = { token: data.token, user: data.user };
      setAuth(authData);
      localStorage.setItem("authUser", JSON.stringify(authData));

      if (data.users) {
        setUsers(data.users);
        localStorage.setItem("authUsersList", JSON.stringify(data.users));
      }

      toast.success("Login successful");
      return authData;
    } catch (error) {
      const errMsg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || "Login failed";
      toast.error(errMsg);
      return null;
    }
  };

  // SIGNUP
  const signup = async (formData) => {
    try {
      const { data } = await api.post("/auth/signup", formData);

      if (!data?.token || !data?.user) {
        toast.error("Invalid signup response");
        return null;
      }

      const authData = { token: data.token, user: data.user };
      setAuth(authData);
      localStorage.setItem("authUser", JSON.stringify(authData));
      toast.success("Signup successful");
      return authData;
    } catch (error) {
      const errMsg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || "Signup failed";
      toast.error(errMsg);
      return null;
    }
  };



  // LOGOUT
  const logout = () => {
    setAuth(null);
    setUsers([]);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authUsersList");
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        users,
        user: auth?.user || null,
        token: auth?.token || null,
        isAdmin: auth?.user?.role === "admin",
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
