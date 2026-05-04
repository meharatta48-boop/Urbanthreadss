import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // all users for admin

  // Load auth from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("authUser");
    const storedUsers = localStorage.getItem("authUsersList");
    if (storedAuth) setAuth(JSON.parse(storedAuth));
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    setLoading(false);
  }, []);

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
