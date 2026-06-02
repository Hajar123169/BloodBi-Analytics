import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  getToken,
  removeToken,
  saveToken,
} from "../services/authService";

export const AuthContext =
  createContext();

export default function AuthProvider({
  children,
}) {
  const [
    userToken,
    setUserToken,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    try {
      const token =
        await getToken();

      console.log(
        "TOKEN:",
        token
      );

      if (token) {
        setUserToken(token);
      }
    } catch (error) {
      console.log(
        "CHECK LOGIN ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function login(token) {
    try {
      await saveToken(token);

      setUserToken(token);
    } catch (error) {
      console.log(
        "LOGIN ERROR:",
        error
      );
    }
  }

  async function logout() {
    try {
      await removeToken();

      setUserToken(null);
    } catch (error) {
      console.log(
        "LOGOUT ERROR:",
        error
      );
    }
  }

  return (
    <AuthContext.Provider
      value={{
        userToken,
        loading,
        login,
        logout,
        setUserToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}