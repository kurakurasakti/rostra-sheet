import { NextResponse } from "next/server";
import {
  getJobRecord,
  generateExcel,
  generateErrorResponse,
} from "@/lib/backend-utils";
import { supabase } from "@/lib/backend-utils";

// GET endpoint to download processed file
export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    // Check if payment was made (in real implementation, this would check the payments table)
    // For now, we'll assume payment was made if the job is completed
    const job = await getJobRecord(jobId);

    if (job.status !== "completed") {
      return NextResponse.json(
        generateErrorResponse(
          "PAYMENT_REQUIRED",
          "Payment required to access this file",
          {
            unlockUrl: `/checkout?jobId=${jobId}`,
          }
        ),
        { status: 403 }
      );
    }

    // Generate Excel file from preview data
    const excelBuffer = await generateExcel(
      job.preview_data?.rows || [],
      job.preview_data?.columns || []
    );

    // Set headers for file download
    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="statement_${jobId}.xlsx"`
    );
    headers.set("Content-Length", excelBuffer.byteLength.toString());

    return new NextResponse(excelBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Download error:", error);

    return NextResponse.json(
      generateErrorResponse("DOWNLOAD_ERROR", "Failed to generate download"),
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
