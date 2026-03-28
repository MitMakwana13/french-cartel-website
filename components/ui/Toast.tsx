"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastCtx = { showToast: (msg: string) => void };
const Ctx = createContext<ToastCtx>({ showToast: () => { } });

export function useToast() { return useContext(Ctx); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [msg, setMsg] = useState("");
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((message: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setMsg(message);
        setVisible(true);
        timerRef.current = setTimeout(() => setVisible(false), 2800);
    }, []);

    return (
        <Ctx.Provider value={{ showToast }}>
            {children}
            {/* Toast */}
            <div
                aria-live="polite"
                style={{
                    position: "fixed",
                    bottom: 36,
                    left: "50%",
                    transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(90px)",
                    opacity: visible ? 1 : 0,
                    background: "#F5C518",
                    color: "#050505",
                    padding: "14px 28px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    letterSpacing: 1,
                    zIndex: 9999,
                    pointerEvents: "none",
                    transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                    clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                    whiteSpace: "nowrap",
                }}
            >
                {msg}
            </div>
        </Ctx.Provider>
    );
}
