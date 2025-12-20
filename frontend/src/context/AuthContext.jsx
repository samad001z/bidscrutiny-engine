import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const loginAs = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem("role", selectedRole);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ role, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
