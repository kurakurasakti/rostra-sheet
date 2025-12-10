import { NextResponse } from "next/server";
import { supabase, updateJobStatus } from "@/lib/backend-utils";
import { Xendit } from "xendit-node";

// Initialize Xendit
const xendit = new Xendit({
  secretKey: process.env.XENDIT_API_KEY!,
});

// POST endpoint to handle Xendit webhooks
export async function POST(request: Request) {
  try {
    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get("x-callback-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature (Xendit uses HMAC)
    const expectedSignature = await generateXenditSignature(body);

    if (signature !== expectedSignature) {
      console.error("Xendit webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse webhook payload
    const payload = JSON.parse(body);

    // Handle different event types
    switch (payload.event) {
      case "invoice.paid": {
        const invoice = payload.data;

        // Extract jobId from external_id
        const jobId = invoice.external_id?.replace("job_", "").split("_")[0];
        if (!jobId) {
          console.error("No jobId in invoice external_id");
          return NextResponse.json(
            { error: "No jobId in invoice external_id" },
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
          email: invoice.customer.email || "unknown@example.com",
          amount: invoice.amount,
          currency: invoice.currency || "idr",
          provider: "xendit",
          status: "completed",
          metadata: {
            paymentId: invoice.id,
            paymentProvider: "xendit",
            invoiceUrl: invoice.invoice_url,
          },
        });

        break;
      }

      case "invoice.expired": {
        const invoice = payload.data;

        // Extract jobId from external_id
        const jobId = invoice.external_id?.replace("job_", "").split("_")[0];

        if (jobId) {
          // Mark job as expired
          await updateJobStatus(jobId, "failed", {
            previewData: { paymentStatus: "expired" },
            confidenceScore: 0,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Xendit event type: ${payload.event}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Xendit webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate Xendit signature
async function generateXenditSignature(body: string): Promise<string> {
  // In a real implementation, this would use the Xendit API key to generate HMAC signature
  // For now, we'll use a simple mock
  const crypto = await import("crypto");
  const hmac = crypto.createHmac("sha256", process.env.XENDIT_API_KEY!);
  hmac.update(body);
  return hmac.digest("hex");
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Callback-Signature",
    },
  });
}
