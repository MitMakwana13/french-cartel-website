"use client";

import { useEffect, useRef } from "react";

/**
 * HeroParallax
 * Attaches a requestAnimationFrame loop to the hero section that:
 *  - Moves the background gradient SAME direction as mouse (22px max)
 *  - Moves logo OPPOSITE direction (26px max)
 *  - Moves headline OPPOSITE direction (14px max)
 *  - Moves subtitle OPPOSITE direction (7px max)
 *  - Moves buttons OPPOSITE direction (4px max)
 *  - Follows a 600px gold glow orb to exact mouse position (CSS 0.15s transition)
 *
 * Lerp smoothing factor: 0.055 → feels liquid, not snappy.
 * Only active when user has NOT scrolled past the hero. Resets on mouse leave.
 *
 * IDs expected on the DOM:
 *   hero-section, hero-bg-layer, hero-glow-orb,
 *   hero-p-logo, hero-p-title, hero-p-sub, hero-p-btns
 */
export default function HeroParallax() {
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const heroEl = document.getElementById("hero-section");
        const bgLayer = document.getElementById("hero-bg-layer");
        const glowOrb = document.getElementById("hero-glow-orb");
        const pLogo = document.getElementById("hero-p-logo");
        const pTitle = document.getElementById("hero-p-title");
        const pSub = document.getElementById("hero-p-sub");
        const pBtns = document.getElementById("hero-p-btns");

        if (!heroEl || !bgLayer || !glowOrb || !pLogo || !pTitle || !pSub || !pBtns) return;

        // Normalised target −1..+1 and lerped current values
        let tX = 0, tY = 0, cX = 0, cY = 0;

        function onMouseMove(e: MouseEvent) {
            // Only run parallax while hero is visible (not scrolled past)
            if (window.scrollY > window.innerHeight) return;

            tX = (e.clientX / window.innerWidth - 0.5) * 2; // −1..+1
            tY = (e.clientY / window.innerHeight - 0.5) * 2;

            // Gold glow orb follows EXACT mouse position; CSS transition handles smoothing
            glowOrb!.style.left = e.clientX + "px";
            glowOrb!.style.top = e.clientY + "px";
        }

        function onMouseLeave() {
            tX = 0;
            tY = 0;
        }

        function loop() {
            // Lerp — factor 0.055 gives the "liquid" feel
            cX += (tX - cX) * 0.055;
            cY += (tY - cY) * 0.055;

            // Background drifts SAME direction (feels far / deep)
            bgLayer!.style.transform = `translate(${cX * 22}px, ${cY * 16}px)`;

            // Logo drifts OPPOSITE (closest layer to viewer)
            // Inject via margin to ADD to Framer Motion's own transform
            pLogo!.style.marginLeft = `${cX * -26}px`;
            pLogo!.style.marginTop = `${cY * -18}px`;

            // Headline drifts opposite, less
            pTitle!.style.transform = `translate(${cX * -14}px, ${cY * -10}px)`;

            // Subtitle — very subtle
            pSub!.style.transform = `translate(${cX * -7}px, ${cY * -5}px)`;

            // Buttons — barely perceptible
            pBtns!.style.transform = `translate(${cX * -4}px, ${cY * -3}px)`;

            rafRef.current = requestAnimationFrame(loop);
        }

        heroEl.addEventListener("mousemove", onMouseMove);
        heroEl.addEventListener("mouseleave", onMouseLeave);
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            heroEl.removeEventListener("mousemove", onMouseMove);
            heroEl.removeEventListener("mouseleave", onMouseLeave);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return null; // pure behaviour, no rendered output
}
