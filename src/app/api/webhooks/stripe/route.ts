import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { supabase, updateJobStatus } from "@/lib/backend-utils";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// POST endpoint to handle Stripe webhooks
export async function POST(request: Request) {
  try {
    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        // Extract jobId from metadata
        const jobId = session.metadata?.jobId;
        if (!jobId) {
          console.error("No jobId in session metadata");
          return NextResponse.json(
            { error: "No jobId in session metadata" },
            { status: 400 }
          );
        }

        // Update job status to indicate payment completed
        await updateJobStatus(jobId, "completed", {
          previewData: { paymentStatus: "paid" },
          confidenceScore: 0.95,
        });

        // Store payment record in database
        await supabase.from("payments").insert({
          job_id: jobId,
          email: session.customer_email || "unknown@example.com",
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || "usd",
          provider: "stripe",
          status: "completed",
          metadata: {
            paymentId: session.id,
            paymentProvider: "stripe",
          },
        });

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const jobId = session.metadata?.jobId;

        if (jobId) {
          // Mark job as expired
          await updateJobStatus(jobId, "failed", {
            previewData: { paymentStatus: "expired" },
            confidenceScore: 0,
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const jobId = paymentIntent.metadata?.jobId;

        if (jobId) {
          // Update payment status
          await supabase
            .from("payments")
            .update({ status: "completed" })
            .eq("job_id", jobId)
            .eq("provider", "stripe");
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    },
  });
}
