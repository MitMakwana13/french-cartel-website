import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
    return (
        <main className="bg-background min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center animate-fade-in-up">
                    <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-foreground uppercase">
                        Secure <span className="text-accent-gold italic">Checkout</span>
                    </h1>
                    <p className="text-foreground/40 text-sm tracking-[3px] uppercase mt-3 font-bold">Almost there</p>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <CheckoutForm />
                </div>
            </div>
        </main>
    );
}
