import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'veat://payment/callback';

interface PaymentInitRequest {
    email: string;
    amount: number;
    reference: string;
    orderId: string;
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, amount, reference, orderId } = await req.json() as PaymentInitRequest;

        if (!PAYSTACK_SECRET_KEY) {
            throw new Error('Paystack secret key not configured');
        }

        if (!email || !amount || !reference || !orderId) {
            throw new Error('Missing required parameters');
        }

        // Initialize transaction with Paystack
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount: Math.round(amount * 100), // Convert to kobo
                reference,
                callback_url: `${APP_URL}?reference=${reference}&orderId=${orderId}`,
                currency: 'NGN',
                metadata: {
                    orderId,
                    custom_fields: [
                        {
                            display_name: "Order ID",
                            variable_name: "order_id",
                            value: orderId
                        }
                    ]
                }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to initialize payment');
        }

        return new Response(
            JSON.stringify(data),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
                status: 200,
            },
        );
    } catch (error) {
        console.error('Payment initialization error:', error);

        return new Response(
            JSON.stringify({
                error: error.message,
                details: error instanceof Error ? error.stack : undefined
            }),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
                status: 400,
            },
        );
    }
}); 