"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-primary-bg p-4 text-center">
      <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-8 max-w-md w-full animate-fade-in-up">
         <AlertCircle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
         <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Module Crash</h2>
         <p className="text-white/50 text-sm mb-6 max-h-32 overflow-y-auto custom-scrollbar italic">
            "{error.message}"
         </p>
         <button
           onClick={() => reset()}
           className="w-full bg-[#ef4444]/20 hover:bg-[#ef4444] border-2 border-[#ef4444] text-white hover:text-white py-3 font-bold uppercase tracking-widest transition-colors"
         >
           Re-initialize App
         </button>
      </div>
    </div>
  );
}
