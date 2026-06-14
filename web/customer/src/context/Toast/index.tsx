import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LanguageContext } from "../Language";
import { localizeKey } from "../../i18n/localization";

export type ToastType = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastInput = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type TypedMessage = {
  text: string;
  type?: ToastType;
};

const ToastContext = createContext<{
  notify: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}>({
  notify: () => "",
  dismiss: () => undefined,
});

function inferToastType(message: string): ToastType {
  const text = message.toLowerCase();
  if (
    /failed|failure|error|invalid|disabled|required|cannot|insufficient|not configured|not available/.test(
      text,
    ) ||
    /失败|错误|异常|无效|不可用|不足|不能|未配置|请先|请输入|请选择/.test(
      message,
    ) ||
    /не удалось|ошиб|недоступ|не настро|недостат|сначала|введите/.test(text)
  ) {
    return "error";
  }
  if (
    /success|successful|copied|sent|created|enabled|disabled|deleted|changed|moved|redeemed|purchased|opened/.test(
      text,
    ) ||
    /成功|已发送|已复制|已创建|已启用|已停用|已删除|已修改|已登录|已到账|已打开/.test(
      message,
    ) ||
    /успеш|скоп|отправ|создан|измен|выполн|открыт|зачислено/.test(text)
  ) {
    return "success";
  }
  if (/warning|limit|minimum|blocked/.test(text) || /上限|最低/.test(message)) {
    return "warning";
  }
  return "info";
}

function normalizeToastMessage(
  message?: string | TypedMessage | null,
): ToastInput | null {
  if (!message) return null;
  if (typeof message === "string") {
    const text = message.trim();
    if (!text) return null;
    return {
      message: text,
      type: inferToastType(text),
    };
  }
  const text = message.text.trim();
  if (!text) return null;
  return {
    message: text,
    type: message.type ?? inferToastType(text),
  };
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") return <CheckCircle2 size={18} />;
  if (type === "error") return <AlertCircle size={18} />;
  if (type === "warning") return <AlertCircle size={18} />;
  return <Info size={18} />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { language } = useContext(LanguageContext);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());
  const nextId = useRef(1);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({ message, type = "info", duration = 3600 }: ToastInput) => {
      const text = message.trim();
      if (!text) return "";
      const id = `toast-${Date.now()}-${nextId.current}`;
      nextId.current += 1;
      const toast = { id, message: text, type };
      setToasts((current) => {
        const next = [toast, ...current];
        for (const removed of next.slice(4)) {
          const timer = timers.current.get(removed.id);
          if (timer) window.clearTimeout(timer);
          timers.current.delete(removed.id);
        }
        return next.slice(0, 4);
      });
      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) {
        window.clearTimeout(timer);
      }
      timers.current.clear();
    },
    [],
  );

  const value = useMemo(() => ({ notify, dismiss }), [dismiss, notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.type}`} key={toast.id}>
            <span className="toast-icon">
              <ToastIcon type={toast.type} />
            </span>
            <span className="toast-text">{toast.message}</span>
            <button
              aria-label={localizeKey(language, "Close")}
              className="toast-close"
              type="button"
              onClick={() => dismiss(toast.id)}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext).notify;
}

export function useToastMessage(message?: string | TypedMessage | null) {
  const notify = useToast();
  const toast = normalizeToastMessage(message);
  const text = toast?.message ?? "";
  const type = toast?.type ?? "info";
  useEffect(() => {
    if (!text) return;
    notify({ message: text, type });
  }, [notify, text, type]);
}
