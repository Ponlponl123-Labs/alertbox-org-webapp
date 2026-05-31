"use client";
import { User } from "@/types/user.types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

export interface UserContext {
  userInfo: User | null;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
}

const userContext = createContext<UserContext>({
  userInfo: null,
  login: async () => false,
  logout: () => {},
});

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserContext["userInfo"]>(null);
  const fetched = useRef(false);

  const login = useCallback(async (code: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams({
        code,
        redirect_uri:
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/app/login/discord"
            : "https://alertbox.org/app/login/discord",
      });

      const r = await fetch("/api/v1/auth/discord", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (r.ok) {
        const token = await r.text();
        const encodedToken = btoa(token);
        setCookie("USRSS", encodedToken, {
          maxAge: 2 * 60 * 60 * 24,
          path: "/",
        });
      }

      return r.ok;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const authCookie = await getCookie("USRSS");
      if (!authCookie) return false;
      const r = await fetch("/api/v1/auth", {
        method: "DELETE",
        headers: {
          authorization: "Bearer " + atob(authCookie),
        },
      });

      if (r.ok) deleteCookie("USRSS");

      window.location.reload();

      return r.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    (async () => {
      const authCookie = await getCookie("USRSS");
      if (!authCookie) return;

      const r = await fetch("/api/v1/me", {
        method: "GET",
        headers: {
          authorization: "Bearer " + atob(authCookie),
        },
      });

      const d = (await r.json()) as User;

      setUserInfo(d);
    })();
  }, []);

  return (
    <userContext.Provider value={{ userInfo, login, logout }}>
      {children}
    </userContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(userContext);
  if (!context) throw new Error("userContext must be used within Provider");
  return context;
};
