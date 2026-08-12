import { useEffect, useMemo } from "react";
import type { TelegramAuthPayload } from "../../types";

export function TelegramLoginWidget({
  botName,
  onAuth,
}: {
  botName: string;
  onAuth: (payload: TelegramAuthPayload) => void;
}) {
  const containerId = useMemo(
    () => `telegram-login-${Math.random().toString(36).slice(2)}`,
    [],
  );
  const callbackName = useMemo(
    () => `onTelegramAuth${Math.random().toString(36).slice(2)}`,
    [],
  );

  useEffect(() => {
    const windowRef = window as typeof window & {
      [key: string]: (payload: TelegramAuthPayload) => void;
    };
    windowRef[callbackName] = onAuth;
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    container.appendChild(script);
    return () => {
      delete windowRef[callbackName];
      container.innerHTML = "";
    };
  }, [botName, callbackName, containerId, onAuth]);

  return <div className="telegram-widget" id={containerId} />;
}
