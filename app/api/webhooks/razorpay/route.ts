import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

// Helper to verify Razorpay signature
const verifySignature = (body: string, signature: string, secret: string) => {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
    return expectedSignature === signature;
};

export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

        // Verification
        if (!signature || !verifySignature(bodyText, signature, webhookSecret)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(bodyText);

        // Handle successful payment
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            const payment = event.payload.payment.entity;
            const order_id = payment.order_id;
            const payment_id = payment.id;

            // Update order status in Supabase
            const { error } = await supabase
                .from('orders')
                .update({ 
                    status: 'new', // Moves from pending_payment to new (visible to admin)
                    razorpay_payment_id: payment_id
                })
                .eq('razorpay_order_id', order_id);

            if (error) {
                console.error("Supabase Error updating order:", error);
                return NextResponse.json({ error: 'Database error' }, { status: 500 });
            }
            
            return NextResponse.json({ status: 'ok' });
        }

        return NextResponse.json({ status: 'ignored' });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown Webhook Error';
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
