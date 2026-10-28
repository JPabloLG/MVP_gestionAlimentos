"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@/types";
import { authRepo } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sess = await authRepo.getSession();
        if (sess) {
          setSession(sess);
          const u = await authRepo.getUserById(sess.userId);
          setUser(u);
        }
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    const sess = await authRepo.login(email, password);
    setSession(sess);
    const u = await authRepo.getUserById(sess.userId);
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    await authRepo.register(name, email, password);
    // auto login after register
    await login(email, password);
  };

  const logout = async () => {
    await authRepo.logout();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
