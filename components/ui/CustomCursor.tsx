"use client";

import { useEffect } from "react";

export default function CustomCursor() {
    useEffect(() => {
        // Only on desktop (no touch)
        if (window.matchMedia("(hover: none)").matches) return;

        const cur = document.getElementById("fc-cursor")!;
        const trail = document.getElementById("fc-cursor-trail")!;
        if (!cur || !trail) return;

        let mx = 0, my = 0, tx = 0, ty = 0;
        let rafId: number;

        const onMove = (e: MouseEvent) => {
            mx = e.clientX; my = e.clientY;
            cur.style.left = mx + "px"; cur.style.top = my + "px";
        };
        document.addEventListener("mousemove", onMove);

        const animTrail = () => {
            tx += (mx - tx) * 0.13; ty += (my - ty) * 0.13;
            trail.style.left = tx + "px"; trail.style.top = ty + "px";
            rafId = requestAnimationFrame(animTrail);
        };
        rafId = requestAnimationFrame(animTrail);

        // Scale up on interactive elements
        const targets = document.querySelectorAll("a, button, .chip, [role='button']");
        const enter = () => { cur.style.transform = "translate(-50%,-50%) scale(2.8)"; trail.style.opacity = "0"; };
        const leave = () => { cur.style.transform = "translate(-50%,-50%) scale(1)"; trail.style.opacity = "1"; };
        targets.forEach(el => { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); });

        return () => {
            document.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(rafId);
            targets.forEach(el => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); });
        };
    }, []);

    return (
        <>
            {/* Main dot */}
            <div id="fc-cursor" style={{
                width: 18, height: 18,
                background: "#F5C518",
                borderRadius: "50%",
                position: "fixed", top: 0, left: 0,
                pointerEvents: "none", zIndex: 9999,
                mixBlendMode: "difference",
                transform: "translate(-50%,-50%)",
                transition: "transform 0.15s",
            }} />
            {/* Trailing ring */}
            <div id="fc-cursor-trail" style={{
                width: 40, height: 40,
                border: "1.5px solid rgba(245,197,24,0.55)",
                borderRadius: "50%",
                position: "fixed", top: 0, left: 0,
                pointerEvents: "none", zIndex: 9998,
                transform: "translate(-50%,-50%)",
                transition: "opacity 0.2s",
            }} />
        </>
    );
}
