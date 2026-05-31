"use client";
import PreParing from "../preparing";
import { redirect, useSearchParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { useEffect, useRef, useState } from "react";
import Error from "../error";
import Success from "../success";

function Page() {
  const { login } = useUserContext();
  const searchParams = useSearchParams();
  const [isLoginSuccess, setIsLoginSuccess] = useState<undefined | boolean>(
    undefined,
  );
  const isCalled = useRef(false);

  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) {
      const urlBuilder = new URL("https://discord.com/oauth2/authorize");
      urlBuilder.searchParams.append("client_id", "1510531382147944488");
      urlBuilder.searchParams.append("response_type", "code");
      urlBuilder.searchParams.append("scope", "email identify");
      urlBuilder.searchParams.append(
        "redirect_uri",
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/app/login/discord"
          : "https://alertbox.org/app/login/discord",
      );

      redirect(urlBuilder.toString());
    } else {
      if (isCalled.current) return;
      isCalled.current = true;

      (async () => {
        const result = await login(code);
        setIsLoginSuccess(result);
        if (result) {
          setTimeout(() => {
            window.location.href = "/app";
          }, 1000);
        }
      })();
    }
  }, [code, login]);

  if (isLoginSuccess === undefined) return <PreParing />;

  return isLoginSuccess ? <Success /> : <Error />;
}

export default Page;
