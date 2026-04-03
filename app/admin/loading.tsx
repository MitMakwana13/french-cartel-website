"use client";

import { Loader } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="w-full h-screen bg-primary-bg flex flex-col items-center justify-center p-4">
       <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 bg-accent-gold/20 rounded-full blur-[20px] animate-pulse"></div>
          <Loader className="w-full h-full text-accent-gold animate-spin relative z-10" />
       </div>
       <p className="text-white/40 text-xs font-bold uppercase tracking-[3px] animate-pulse">
         Synchronizing Workspace...
       </p>
    </div>
  );
}
