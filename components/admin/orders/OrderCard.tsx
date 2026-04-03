"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Phone, MessageCircle, X, Printer, Send } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/supabase/types";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: string, prevStatus: OrderStatus, newStatus: OrderStatus) => void;
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const { items } = order;

  // Format time gracefully
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(order.created_at), { addSuffix: true });
    } catch {
      return "just now";
    }
  }, [order.created_at]);

  // Clean WhatsApp number
  const waNumber = order.customer_phone.replace(/\D/g, "");
  // Pre-fill WA message
  const waMessage = encodeURIComponent(`Hi ${order.customer_name}, this is French Cartel regarding your order #${order.order_number}.`);

  const handleStatusChange = (newStatus: OrderStatus) => {
    onUpdateStatus(order.id, order.status, newStatus);
  };

  const printTicket = () => {
     const w = window.open('', '_blank', 'width=350,height=600');
     if (!w) return;
     const itemsHtml = `
        <div style="font-weight: bold;">1x ${items.size?.name}</div>
        ${items.sauces?.length ? `<div>Sauces: ${items.sauces.join(', ')}</div>` : ''}
        ${items.seasonings?.length ? `<div>Seasonings: ${items.seasonings.join(', ')}</div>` : ''}
        ${items.addons?.map(a => `<div>+ ${a.name}</div>`).join('') || ''}
        ${items.drinks?.map(d => `<div>+ ${d.name}</div>`).join('') || ''}
     `;
     w.document.write(`
        <html>
        <head>
           <style>
              body { font-family: monospace; width: 300px; margin: 0 auto; color: black; padding: 10px; }
              h1 { font-size: 24px; text-align: center; margin: 0 0 10px 0; }
              .divider { border-bottom: 2px dashed black; margin: 10px 0; }
              .b { font-weight: bold; }
           </style>
        </head>
        <body>
           <h1>FRENCH CARTEL</h1>
           <div class="divider"></div>
           <div class="b" style="font-size: 20px;">Order #${order.order_number}</div>
           <div>Customer: ${order.customer_name}</div>
           <div>Phone: ${order.customer_phone}</div>
           <div class="divider"></div>
           ${itemsHtml}
           <div class="divider"></div>
           ${order.instructions ? `<div>Notes: ${order.instructions}</div><div class="divider"></div>` : ''}
           <div class="b text-right">TOTAL: Rs.${order.total_price}</div>
           <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
        </html>
     `);
     w.document.close();
  };

  // Ready Notification specifically parsing the Name and generated order number.
  const waReadyMessage = encodeURIComponent(`Hey ${order.customer_name}! Your French Cartel order #${order.order_number} is READY for pickup! 🍟`);

  return (
    <div className="bg-card-bg border border-white/5 rounded-sm p-4 relative shadow-sm flex flex-col hover:border-white/10 transition-colors w-full group">
      
      {/* Top Header: Order Number & Time */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-2xl font-black text-accent-gold tracking-tight">
          #{order.order_number}
        </h3>
        <div className="flex items-center gap-2">
            <button onClick={printTicket} className="text-white/30 hover:text-white transition-colors" title="Print Kitchen Ticket">
                <Printer size={14} />
            </button>
            <span className="text-white/40 text-xs font-medium bg-white/5 px-2 py-1 rounded-sm">
              {timeAgo}
            </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <p className="font-bold text-white text-base tracking-wide capitalize">
          {order.customer_name}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <a
            href={`tel:${order.customer_phone}`}
            className="flex items-center gap-1.5 text-white/50 text-xs hover:text-white transition-colors"
          >
            <Phone size={12} />
            {order.customer_phone}
          </a>
          <a
            href={`https://wa.me/91${waNumber}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#25D366]/70 text-xs hover:text-[#25D366] transition-colors"
          >
            <MessageCircle size={12} />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Order Summary (Compact) */}
      <div className="flex-1 bg-[#050505] rounded-sm p-3 border border-white/5 mb-4">
        <div className="text-sm font-medium text-white/90 flex justify-between border-b border-white/5 pb-2 mb-2">
          <span>{items.size?.name || "Size"} <span className="text-white/40 text-xs ml-1">({items.size?.code || "N/A"})</span></span>
          <span className="text-white/50">₹{items.size?.price || 0}</span>
        </div>
        
        {items.sauces && items.sauces.length > 0 && (
          <div className="text-xs text-white/60 mb-1 leading-relaxed">
            <span className="text-white/30 mr-1">Sauces:</span>
            {items.sauces.join(", ")}
          </div>
        )}
        
        {items.seasonings && items.seasonings.length > 0 && (
          <div className="text-xs text-white/60 mb-1 leading-relaxed">
            <span className="text-white/30 mr-1">Seasoning:</span>
            {items.seasonings.join(", ")}
          </div>
        )}
        
        {items.addons && items.addons.length > 0 && (
          <div className="text-xs text-white/60 mb-1 leading-relaxed space-y-0.5">
            {items.addons.map((addon, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span><span className="text-white/30 mr-1">+ Addon:</span>{addon.emoji} {addon.name}</span>
                <span className="text-white/40">+₹{addon.price}</span>
              </div>
            ))}
          </div>
        )}
        
        {items.drinks && items.drinks.length > 0 && (
          <div className="text-xs text-white/60 mb-1 leading-relaxed space-y-0.5 mt-2 pt-2 border-t border-white/5">
            {items.drinks.map((drink, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span>{drink.emoji} {drink.name}</span>
                <span className="text-white/40">₹{drink.price}</span>
              </div>
            ))}
          </div>
        )}
        
        {order.instructions && (
          <div className="mt-3 text-xs italic text-accent-gold/80 bg-accent-gold/5 p-2 border-l-2 border-accent-gold/30">
            "{order.instructions}"
          </div>
        )}
      </div>

      {/* Total & Payment */}
      <div className="flex justify-between items-end mb-5">
        <div>
          <p className="text-[0.65rem] text-white/40 uppercase tracking-widest font-bold">Total Bill</p>
          <p className="text-xl font-black text-accent-gold">₹{order.total_price}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] text-white/40 uppercase tracking-widest font-bold">Payment</p>
          <p className={`text-xs font-bold uppercase tracking-wider ${order.payment_status === 'paid' ? 'text-[#34d399]' : 'text-accent-gold'}`}>
            {order.payment_status}
          </p>
        </div>
      </div>

      {/* Contextual Actions */}
      <div className="mt-auto space-y-2">
        {order.status === "new" && (
          <>
            <button
              onClick={() => handleStatusChange("accepted")}
              className="w-full bg-accent-gold hover:bg-white text-black font-black uppercase tracking-widest text-sm py-3 rounded-sm transition-colors shadow-[0_0_15px_rgba(245,197,24,0.15)] focus:ring-2 focus:ring-accent-gold/50"
            >
              Accept Order
            </button>
            <button
              onClick={() => handleStatusChange("cancelled")}
              className="w-full flex items-center justify-center gap-1 text-[#ef4444]/70 hover:text-[#ef4444] hover:bg-[#ef4444]/10 text-xs font-bold uppercase py-2 rounded-sm transition-colors"
            >
              <X size={14} /> Cancel
            </button>
          </>
        )}

        {order.status === "accepted" && (
          <button
            onClick={() => handleStatusChange("preparing")}
            className="w-full border-2 border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-black font-black uppercase tracking-widest text-xs py-3 rounded-sm transition-colors"
          >
            Start Preparing
          </button>
        )}

        {order.status === "preparing" && (
          <button
            onClick={() => handleStatusChange("ready")}
            className="w-full bg-[#34d399] hover:bg-[#34d399]/80 text-[#064e3b] font-black uppercase tracking-widest text-sm py-3 rounded-sm transition-colors shadow-[0_0_15px_rgba(52,211,153,0.15)]"
          >
            Ready For Pickup
          </button>
        )}

        {order.status === "ready" && (
          <div className="flex flex-col gap-2">
             <a
               href={`https://wa.me/91${waNumber}?text=${waReadyMessage}`}
               target="_blank"
               rel="noopener noreferrer"
               className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/80 text-[#064e3b] font-black uppercase tracking-widest text-xs py-3 rounded-sm transition-colors shadow-[0_0_15px_rgba(37,211,102,0.15)]"
             >
               <Send size={14} /> Send Ready Ping
             </a>
             <button
               onClick={() => handleStatusChange("completed")}
               className="w-full bg-white/10 hover:bg-white text-black font-black uppercase tracking-widest text-xs py-3 rounded-sm transition-colors"
             >
               Mark Complete
             </button>
          </div>
        )}

        {/* Universal Cancel button for intermediate states */}
        {["accepted", "preparing", "ready"].includes(order.status) && (
          <button
            onClick={() => handleStatusChange("cancelled")}
            className="w-full text-center text-white/20 hover:text-[#ef4444] text-[0.65rem] font-bold uppercase pt-2 transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>
      
    </div>
  );
}
