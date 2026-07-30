import { createContext, useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../socket/socketManager.js";
import api from "../axiosConfig.js";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.get("/api/me");
        setUser(response.data.userInfo);
      } catch (error) {
        setUser(null);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, loading]);

  function login(userData) {
    setUser(userData);
    setLoading(false);
  }

  async function logout() {
    try {
      await api.post("/api/logout");
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
export default AuthContext;