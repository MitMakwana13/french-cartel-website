import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, pickupTime, items } = body;

        interface CheckoutItem {
            price: number;
            quantity: number;
            menu_item_id: string;
            special_instructions?: string;
        }

        // 1. Calculate total server-side
        const totalAmount = items.reduce((acc: number, item: CheckoutItem) => {
            return acc + (item.price * item.quantity);
        }, 0);

        // 2. Create Razorpay order
        const options = {
            amount: Math.round(totalAmount * 100), // amount in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 3. Create Order in Supabase
        const { data: orderParams, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: name,
                customer_phone: phone,
                pickup_time: new Date(pickupTime).toISOString(),
                total_amount: totalAmount,
                status: 'pending_payment',
                razorpay_order_id: razorpayOrder.id,
            })
            .select()
            .single();

        if (orderError) throw new Error(orderError.message);

        // 4. Create Order Items in Supabase
        const orderItemsParams = items.map((item: CheckoutItem) => ({
            order_id: orderParams.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            special_instructions: item.special_instructions || null,
            unit_price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsParams);

        if (itemsError) throw new Error(itemsError.message);

        // 5. Return success to client
        return NextResponse.json({
            razorpayOrder,
            orderId: orderParams.id
        });
        
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Checkout API Error:', error);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
