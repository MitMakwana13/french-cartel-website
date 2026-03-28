"use client";

import { useEffect, useRef } from "react";

export default function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        const resize = () => {
            canvas.width = canvas.parentElement?.offsetWidth ?? window.innerWidth;
            canvas.height = canvas.parentElement?.offsetHeight ?? window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number };
        const pts: Particle[] = Array.from({ length: 45 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.55 - 0.2,
            r: Math.random() * 2 + 0.5,
            a: Math.random() * 0.7 + 0.1,
        }));

        let rafId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.a -= 0.0025;
                if (p.a <= 0 || p.y < -10) {
                    p.x = Math.random() * canvas.width;
                    p.y = canvas.height + 10;
                    p.a = Math.random() * 0.6 + 0.2;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(245,197,24,${p.a})`;
                ctx.fill();
            });
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);

        return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                pointerEvents: "none", zIndex: 1,
            }}
        />
    );
}
