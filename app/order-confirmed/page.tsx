import Link from "next/link";
import Image from "next/image";
import { CheckCircle, MapPin } from "lucide-react";

export default function OrderConfirmedPage() {
    return (
        <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center relative">

                {/* Gold glow backdrop */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-accent-gold/10 rounded-full blur-[100px] pointer-events-none -z-10" />

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Image
                        src="/assets/logo.png"
                        alt="French Cartel"
                        width={120}
                        height={120}
                        className="object-contain drop-shadow-[0_0_30px_rgba(245,197,24,0.4)]"
                    />
                </div>

                {/* Check */}
                <div className="flex justify-center mb-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-full p-3">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2">
                    Order Confirmed!
                </h1>
                <p className="text-2xl font-display font-bold text-accent-gold italic mb-4">
                    The Cartel&apos;s on it. 🍟
                </p>
                <p className="text-white/50 text-sm leading-relaxed mb-2">
                    Your payment was successful. Your loaded bowl is being freshly prepared.
                </p>
                <p className="text-white/40 text-sm mb-8">
                    We&apos;ll send you a confirmation on WhatsApp shortly.
                </p>

                {/* Pickup info strip */}
                <div className="flex items-center justify-center gap-3 bg-accent-gold/8 border border-accent-gold/20 px-5 py-3 mb-8">
                    <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
                    <p className="text-white/60 text-xs text-left leading-snug">
                        <span className="font-bold text-accent-gold block">Pickup Location</span>
                        Hazira Rd, near Pal RTO, Adajan, Surat
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/order"
                        className="block w-full bg-accent-gold text-primary-bg py-4 font-black uppercase tracking-[2px] text-sm hover:bg-white transition-colors"
                    >
                        Order Again
                    </Link>
                    <Link
                        href="/"
                        className="block w-full border border-white/10 text-white/50 py-3.5 font-bold uppercase tracking-wider text-sm hover:border-white/30 hover:text-white transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
