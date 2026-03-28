import Link from "next/link";
import Image from "next/image";
import { Instagram, MapPin, Clock } from "lucide-react";

const QUICK_LINKS = [
    { name: "Menu", path: "/menu" },
    { name: "Build Your Bowl", path: "/order" },
    { name: "Catering", path: "/catering" },
    { name: "About", path: "/about" },
];

export default function Footer() {
    return (
        <>
            {/* Gold separator */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />

            <footer className="bg-primary-bg py-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/5">

                        {/* ── LEFT: Brand ── */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <Link href="/" className="flex-shrink-0">
                                <Image
                                    src="/assets/logo.png"
                                    alt="French Cartel"
                                    width={140}
                                    height={56}
                                    className="h-14 w-auto object-contain"
                                />
                            </Link>
                            <div>
                                <p className="text-accent-gold font-black tracking-[3px] text-sm uppercase">EST. 2025, Surat</p>
                                <p className="text-white/30 text-sm mt-1">Surat&apos;s Most Wanted Fries.</p>
                            </div>
                            <a
                                href="https://instagram.com/_frenchcartel"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-white/40 text-sm hover:text-accent-gold transition-colors mt-1"
                            >
                                <Instagram className="h-4 w-4" />
                                @_frenchcartel
                            </a>
                        </div>

                        {/* ── CENTER: Info ── */}
                        <div className="flex flex-col items-center gap-5 text-center">
                            <div className="flex items-start gap-3 text-left max-w-xs">
                                <MapPin className="h-4 w-4 text-accent-gold mt-1 shrink-0" />
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Hazira Rd, near Pal RTO, opp. Sangini Aspire,<br />
                                    Adajan, Surat, Gujarat 394510
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Instagram className="h-4 w-4 text-accent-gold shrink-0" />
                                <a
                                    href="https://www.instagram.com/_frenchcartel/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent-gold text-sm font-bold hover:text-white transition-colors"
                                >
                                    @_frenchcartel
                                </a>
                            </div>
                            <div className="flex items-start gap-3 text-left">
                                <Clock className="h-4 w-4 text-accent-gold mt-0.5 shrink-0" />
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Open: Evenings<br />
                                    <span className="text-white/25 text-xs">(Check Instagram for exact timings)</span>
                                </p>
                            </div>
                        </div>

                        {/* ── RIGHT: Quick Links ── */}
                        <div className="flex flex-col items-center md:items-end gap-3">
                            <h4 className="text-white/30 font-bold uppercase tracking-[3px] text-xs mb-2">Quick Links</h4>
                            {QUICK_LINKS.map(link => (
                                <Link
                                    key={link.name}
                                    href={link.path}
                                    className="text-white/50 text-sm hover:text-accent-gold transition-colors duration-200 font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* ── BOTTOM BAR ── */}
                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/20 text-xs tracking-wide text-center md:text-left">
                            © 2025 French Cartel · Surat, Gujarat · All Rights Reserved
                        </p>
                        <p className="text-[#ff5c5c] text-xs font-black uppercase tracking-[2px] border border-[#E3342F]/30 bg-[#E3342F]/8 px-4 py-1.5">
                            No COD · Online Payment Only
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
