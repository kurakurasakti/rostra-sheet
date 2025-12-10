import { NextResponse } from "next/server";
import {
  getJobRecord,
  generatePreviewResponse,
  generateErrorResponse,
} from "@/lib/backend-utils";
import { Worker } from "bullmq";
import { Redis } from "@upstash/redis";
import { parseStatementWithAI } from "@/lib/ai-service";
import { parsePDF, parseExcel } from "@/lib/backend-utils";

// Initialize Upstash Redis client
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Create worker for processing jobs
const worker = new Worker(
  "statement-processing",
  async (job) => {
    try {
      const { jobId, fileType, fileBuffer, fileName } = job.data;

      // Convert base64 back to buffer
      const buffer = Buffer.from(fileBuffer, "base64");

      // Process file based on type
      let result;
      if (fileType === "application/pdf") {
        // Parse PDF file to get text content
        const pdfResult = await parsePDF(buffer);
        // Use Gemini AI to parse the content
        result = await parseStatementWithAI(pdfResult.text, fileType);
      } else {
        // Parse Excel file to get structured data
        const excelResult = await parseExcel(buffer);
        // Convert Excel data to text format for AI processing
        const excelText = JSON.stringify(excelResult.rows);
        // Use Gemini AI to parse the content
        result = await parseStatementWithAI(excelText, fileType);
      }

      // Generate preview data from AI result
      const previewData = {
        columns: result.columns || [],
        rows: result.rows || [],
        confidenceScore: result.confidenceScore || 0.95,
        fileType: fileType,
        detectedBank: result.detectedBank || null,
      };

      // Update job status with preview data
      // In real implementation, this would call the actual updateJobStatus function
      console.log(
        `Job ${jobId} completed with confidence: ${previewData.confidenceScore}`
      );

      return previewData;
    } catch (error) {
      console.error("Job processing error:", error);
      // In real implementation, this would call the actual updateJobStatus function
      console.log(`Job ${job.data.jobId} failed`);
      throw error;
    }
  },
  {
    connection: redisClient as any,
    concurrency: 5,
  }
);

// GET endpoint to check job status and get preview
export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    // Get job record from database
    const job = await getJobRecord(jobId);

    // Check job status
    if (job.status === "completed") {
      // Return preview data
      return NextResponse.json(
        generatePreviewResponse(jobId, {
          columns: job.preview_data?.columns || [],
          rows: job.preview_data?.rows || [],
          confidenceScore: job.confidence_score || 0,
          fileType: job.file_type,
          detectedBank: job.preview_data?.detectedBank || null,
        })
      );
    } else if (job.status === "processing") {
      // Job still processing
      return NextResponse.json(
        {
          status: "processing",
          progress: 65, // Would be calculated in real implementation
          estimatedSecondsRemaining: 8,
        },
        { status: 202 }
      );
    } else if (job.status === "failed") {
      // Job failed
      return NextResponse.json(
        generateErrorResponse("PROCESSING_FAILED", "File processing failed"),
        { status: 500 }
      );
    } else {
      // Job uploaded but not started
      return NextResponse.json(
        {
          status: "queued",
          position: 1, // Would be calculated in real implementation
        },
        { status: 202 }
      );
    }
  } catch (error) {
    console.error("Preview error:", error);

    return NextResponse.json(
      generateErrorResponse("JOB_NOT_FOUND", "Job not found"),
      { status: 404 }
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
