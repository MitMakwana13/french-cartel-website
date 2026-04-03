"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Menu", path: "/menu" },
        { name: "Build Your Bowl", path: "/order" },
        { name: "Catering", path: "/catering" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/#contact" },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#050505]/95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md" : "bg-primary-bg/80"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex-shrink-0 flex flex-col justify-center">
                        <span className="font-display font-black text-2xl italic tracking-wide text-accent-gold drop-shadow-lg">French Cartel</span>
                        <span className="text-[0.6rem] tracking-[3px] text-text-muted mt-1 uppercase">Est. 2025</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                className="text-[0.8rem] font-bold text-text-white tracking-[2px] uppercase hover:text-accent-gold transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-accent-gold hover:after:w-full after:transition-all after:duration-300"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center">
                        <Link
                            href="/order"
                            className="border-2 border-accent-gold text-accent-gold px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-accent-gold hover:text-primary-bg transition-colors duration-300"
                        >
                            Order Now
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-text-white hover:text-accent-gold focus:outline-none"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-card-bg border-t border-white/5 absolute w-full left-0 drop-shadow-2xl">
                    <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3 text-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-4 text-base font-medium text-text-white uppercase tracking-widest hover:text-accent-gold border-b border-white/5"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/order"
                            onClick={() => setIsOpen(false)}
                            className="mt-6 block w-full text-center border-2 border-accent-gold bg-accent-gold text-primary-bg px-6 py-3 rounded-sm text-base font-bold uppercase tracking-wider"
                        >
                            Order Now
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
