"use client";

import { Alert, Snackbar } from "@mui/material";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type NotifySeverity = "success" | "info" | "warning" | "error";

interface NotifyOptions {
  message: string;
  description?: string;
}

interface NotifyContextValue {
  success: (options: NotifyOptions) => void;
  info: (options: NotifyOptions) => void;
  warning: (options: NotifyOptions) => void;
  error: (options: NotifyOptions) => void;
}

const NotifyContext = createContext<NotifyContextValue | null>(null);

interface ToastState {
  key: number;
  severity: NotifySeverity;
  message: string;
  description?: string;
}

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback(
    (severity: NotifySeverity, options: NotifyOptions) => {
      setToast({ key: Date.now(), severity, ...options });
    },
    []
  );

  const value = useMemo<NotifyContextValue>(
    () => ({
      success: (options) => show("success", options),
      info: (options) => show("info", options),
      warning: (options) => show("warning", options),
      error: (options) => show("error", options),
    }),
    [show]
  );

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={toast !== null}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={() => setToast(null)}
      >
        {toast ? (
          <Alert
            onClose={() => setToast(null)}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            <strong>{toast.message}</strong>
            {toast.description ? <div>{toast.description}</div> : null}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotifyContext.Provider>
  );
}

export function useNotify(): NotifyContextValue {
  const context = useContext(NotifyContext);
  if (!context) {
    throw new Error("useNotify must be used within a NotifyProvider");
  }
  return context;
}
